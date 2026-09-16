import {
    Children,
    cloneElement,
    forwardRef,
    isValidElement,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type ReactElement,
    type ReactNode,
} from 'react'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass, SwiperOptions } from 'swiper/types'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

/**
 * Drop-in replacement for react-slick's <Slider>, rendered with Swiper.
 *
 * Accepts the slick-style `settings` props already used across the codebase
 * (spread onto the element) and the slick imperative ref API
 * (slickNext/slickPrev/slickGoTo + innerSlider.props.slidesToShow), so call
 * sites only need to change their import line.
 *
 * Deliberate approximations (visual QA advised):
 * - `centerPadding` is dropped — `centeredSlides` + fractional
 *   `slidesPerView` already produces the side-peek effect.
 * - `dots`/`autoplay` inside `responsive` tiers enable the feature globally
 *   (Swiper can't toggle pagination/autoplay per breakpoint).
 * - `cssEase` has no Swiper equivalent and is ignored; `slidesToScroll`/
 *   `swipeToSlide` are ignored — every slider snaps per-slide (see
 *   tierParams).
 */

// Props slick arrow elements receive when cloned (mirrors react-slick, which
// injects onClick + a className containing "slick-disabled" at the edges —
// the codebase's custom arrows read exactly these two).
interface SlickArrowProps {
    onClick?: () => void
    className?: string
}

// Only the slick settings actually used in this codebase — kept narrow on
// purpose so unsupported options surface as type errors instead of silently
// doing nothing.
export interface SlickSettings {
    slidesToShow?: number
    slidesToScroll?: number
    infinite?: boolean
    speed?: number
    autoplay?: boolean
    autoplaySpeed?: number
    dots?: boolean
    arrows?: boolean
    nextArrow?: ReactElement<SlickArrowProps> | null
    prevArrow?: ReactElement<SlickArrowProps> | null
    centerMode?: boolean
    centerPadding?: string
    initialSlide?: number
    fade?: boolean
    rtl?: boolean
    pauseOnHover?: boolean
    draggable?: boolean
    touchMove?: boolean
    swipeToSlide?: boolean
    cssEase?: string
    beforeChange?: (currentSlide: number, nextSlide: number) => void
    afterChange?: (currentSlide: number) => void
    // slick responsive entries are max-width based: `settings` apply when
    // viewport <= `breakpoint`.
    responsive?: Array<{ breakpoint: number; settings: SlickSettings }>
}

export interface SlickToSwiperProps extends SlickSettings {
    children?: ReactNode
    className?: string
    style?: CSSProperties
    // Slide gap in px (number or '16px' string) → Swiper `spaceBetween`.
    // Replaces the CSS `gap` SliderCustom used to put on .slick-track, which
    // Swiper's slide-width math can't see. Defaults to 5 (SliderCustom's
    // old default gap).
    gap?: number | string
}

// The slice of react-slick's ref API this codebase actually calls
// (slickNext/Prev/GoTo, slickPause/Play for the ads video slider,
// innerSlider props/state reads, and props.children introspection).
export interface SlickSliderHandle {
    slickNext: () => void
    slickPrev: () => void
    slickGoTo: (slide: number) => void
    slickPause: () => void
    slickPlay: () => void
    innerSlider: {
        props: { slidesToShow: number }
        state: { currentSlide: number }
    }
    props: { children: ReactNode[] }
}

const toPx = (value: number | string | undefined, fallback: number): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
        const parsed = parseFloat(value)
        if (!Number.isNaN(parsed)) return parsed
    }
    return fallback
}

// Per-breakpoint params Swiper supports; anything global (loop, autoplay,
// pagination) is unioned across tiers instead.
const tierParams = (s: SlickSettings): SwiperOptions => {
    const params: SwiperOptions = {}
    if (s.slidesToShow != null) params.slidesPerView = s.slidesToShow
    // slidesToScroll is deliberately NOT mapped: every slider snaps
    // per-slide (Swiper's slidesPerGroup default of 1), matching the
    // "Highlights for you" slider's swipe feel. Grouped snapping made short
    // swipes bounce back (drag had to exceed half the whole group) and
    // arrows jump several cards at once.
    if (s.centerMode != null) params.centeredSlides = s.centerMode
    return params
}

/**
 * slick (desktop-first): tier `settings` apply when width <= `breakpoint`;
 * base settings apply above the largest breakpoint.
 * Swiper (mobile-first): top-level params apply from 0, `breakpoints[n]`
 * apply from width >= n.
 *
 * With tiers sorted ascending b1 < ... < bn, slick's intervals are
 * [0, b1] → s(b1), (b1, b2] → s(b2), …, (bn, ∞) → base. So Swiper gets the
 * smallest tier as its base and each boundary maps to the NEXT tier up.
 */
const convertResponsive = (
    base: SlickSettings
): { basePart: SwiperOptions; breakpoints?: Record<number, SwiperOptions> } => {
    const tiers = [...(base.responsive ?? [])].sort(
        (a, b) => a.breakpoint - b.breakpoint
    )
    if (tiers.length === 0) return { basePart: tierParams(base) }

    // slick merges an active tier's settings over the base settings.
    const merged = (s: SlickSettings): SwiperOptions =>
        tierParams({ ...base, ...s })

    const breakpoints: Record<number, SwiperOptions> = {}
    tiers.forEach((tier, i) => {
        breakpoints[tier.breakpoint] =
            i + 1 < tiers.length
                ? merged(tiers[i + 1].settings)
                : tierParams(base)
    })
    return { basePart: merged(tiers[0].settings), breakpoints }
}

/**
 * The slick settings active at the given viewport width (slick semantics:
 * the tier with the smallest breakpoint >= width wins; base above all
 * tiers), merged over the base. `null` width (SSR / pre-mount) → base.
 *
 * Swiper can't vary loop/autoplay/pagination per breakpoint, so instead of
 * unioning them across tiers (which forced loop mode onto fractional-
 * slidesPerView mobile tiers that slick had marked `infinite: false` —
 * Swiper's loop-rewind jumps made those sliders feel janky) we resolve them
 * from the tier that's actually active and remount when it flips.
 */
const activeTierSettings = (
    settings: SlickSettings,
    width: number | null
): SlickSettings => {
    const tiers = [...(settings.responsive ?? [])].sort(
        (a, b) => a.breakpoint - b.breakpoint
    )
    if (width == null || tiers.length === 0) return settings
    const active = tiers.find((tier) => width <= tier.breakpoint)
    return active ? { ...settings, ...active.settings } : settings
}

const SlickToSwiper = forwardRef<SlickSliderHandle, SlickToSwiperProps>(
    (props, ref) => {
        const {
            children,
            className,
            style,
            gap,
            beforeChange,
            afterChange,
            nextArrow,
            prevArrow,
            ...settings
        } = props

        const swiperRef = useRef<SwiperClass | null>(null)
        const [isBeginning, setIsBeginning] = useState(true)
        const [isEnd, setIsEnd] = useState(false)

        const { basePart, breakpoints } = useMemo(
            () => convertResponsive(settings),
            // Settings objects are rebuilt each render at call sites; key on
            // the values that actually change layout.
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [JSON.stringify(settings, (_, v) =>
                isValidElement(v) ? undefined : v
            )]
        )

        // Viewport-dependent settings (loop/autoplay/dots/speed) come from
        // the ACTIVE slick tier — see activeTierSettings. Tracked via resize
        // so crossing a breakpoint re-resolves them.
        const [viewportWidth, setViewportWidth] = useState<number | null>(
            null
        )
        useEffect(() => {
            const update = () => setViewportWidth(window.innerWidth)
            update()
            window.addEventListener('resize', update)
            return () => window.removeEventListener('resize', update)
        }, [])

        const active = useMemo(
            () => activeTierSettings(settings, viewportWidth),
            // Same stable-stringify rationale as convertResponsive above.
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [
                viewportWidth,
                JSON.stringify(settings, (_, v) =>
                    isValidElement(v) ? undefined : v
                ),
            ]
        )

        const autoplayEnabled = Boolean(active.autoplay)
        const dotsEnabled = Boolean(active.dots)
        // slick defaults infinite to true; fade + loop conflict in Swiper.
        const loop = active.infinite !== false && !settings.fade

        useImperativeHandle(
            ref,
            () => ({
                slickNext: () => swiperRef.current?.slideNext(),
                slickPrev: () => swiperRef.current?.slidePrev(),
                // In loop mode Swiper duplicates slides internally, so a
                // logical index has to go through slideToLoop — slideTo()
                // there resolves against the duplicated slide array and
                // lands on the wrong (often off-screen) slide.
                slickGoTo: (slide: number) =>
                    loop
                        ? swiperRef.current?.slideToLoop(slide)
                        : swiperRef.current?.slideTo(slide),
                slickPause: () => swiperRef.current?.autoplay?.stop(),
                slickPlay: () => swiperRef.current?.autoplay?.start(),
                // Shims for slick internals read across the codebase:
                // SliderSectionHeader's scrollability check reads
                // innerSlider.props.slidesToShow; the ads slider reads
                // innerSlider.state.currentSlide and props.children.
                get innerSlider() {
                    const perView = swiperRef.current?.params?.slidesPerView
                    return {
                        props: {
                            slidesToShow:
                                typeof perView === 'number' ? perView : 1,
                        },
                        state: {
                            currentSlide: swiperRef.current?.realIndex ?? 0,
                        },
                    }
                },
                props: { children: Children.toArray(children) },
            }),
            [children, loop]
        )

        const showArrows =
            settings.arrows !== false && Boolean(nextArrow || prevArrow)

        const arrowClass = (side: 'prev' | 'next', disabled: boolean) =>
            `slick-arrow slick-${side}${disabled ? ' slick-disabled' : ''}`

        const updateEdges = (swiper: SwiperClass) => {
            setIsBeginning(swiper.isBeginning)
            setIsEnd(swiper.isEnd)
        }

        const containerRef = useRef<HTMLDivElement | null>(null)
        useEffect(() => {
            if (!autoplayEnabled) return
            const node = containerRef.current
            if (!node || typeof IntersectionObserver === 'undefined') return

            const observer = new IntersectionObserver(
                ([entry]) => {
                    const autoplay = swiperRef.current?.autoplay
                    if (!autoplay) return
                    if (entry.isIntersecting) {
                        autoplay.start()
                    } else {
                        autoplay.stop()
                    }
                },
                { rootMargin: '100px' }
            )
            observer.observe(node)
            return () => observer.disconnect()
        }, [autoplayEnabled])

        return (
            // Arrows are positioned absolutely by their own styled
            // components, exactly as they were inside .slick-slider —
            // this wrapper recreates that positioning context.
            <div
                ref={containerRef}
                className={className}
                style={{
                    position: 'relative',
                    width: '100%',
                    // Mirror slick's track CSS: without this, mouse-dragging
                    // a slide selects text instead of sliding.
                    userSelect: 'none',
                    ...style,
                }}
                dir={settings.rtl ? 'rtl' : undefined}
                // Mirror slick's `dragstart` suppression: mouse-dragging an
                // <img>/<a> otherwise starts the browser's native ghost-image
                // drag, which steals the gesture from Swiper — with a mouse,
                // no slider would slide. (Slide children keep working; only
                // native drag-and-drop inside the slider is disabled.)
                onDragStart={(e) => e.preventDefault()}
            >
                <Swiper
                    // Loop mode can't be toggled on a live instance —
                    // remount when the active tier flips it.
                    key={`loop-${loop}`}
                    modules={[Autoplay, EffectFade, Pagination]}
                    updateOnWindowResize={false}
                    {...basePart}
                    breakpoints={breakpoints}
                    spaceBetween={toPx(gap, 5)}
                    // slick advances after dragging ~20% of the list width
                    // (touchThreshold default); Swiper's 50% default made slow
                    // partial swipes snap back, feeling "stuck" on mobile.
                    longSwipesRatio={0.2}
                    loop={loop}
                    speed={active.speed ?? 500}
                    initialSlide={settings.initialSlide ?? 0}
                    effect={settings.fade ? 'fade' : undefined}
                    fadeEffect={
                        settings.fade ? { crossFade: true } : undefined
                    }
                    allowTouchMove={
                        settings.draggable !== false &&
                        settings.touchMove !== false
                    }
                    autoplay={
                        autoplayEnabled
                            ? {
                                  delay: active.autoplaySpeed ?? 3000,
                                  disableOnInteraction: false,
                                  pauseOnMouseEnter:
                                      active.pauseOnHover ?? false,
                              }
                            : false
                    }
                    pagination={
                        dotsEnabled ? { clickable: true } : false
                    }
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper
                        updateEdges(swiper)
                    }}
                    onSlideChange={(swiper) => {
                        updateEdges(swiper)
                        beforeChange?.(swiper.previousIndex, swiper.realIndex)
                    }}
                    onSlideChangeTransitionEnd={(swiper) =>
                        afterChange?.(swiper.realIndex)
                    }
                    onResize={updateEdges}
                >
                    {Children.toArray(children).map((child, index) => (
                        <SwiperSlide key={index} style={{ height: 'auto' }}>
                            {child}
                        </SwiperSlide>
                    ))}
                </Swiper>

                {showArrows && prevArrow && isValidElement(prevArrow)
                    ? cloneElement(prevArrow, {
                          onClick: () => swiperRef.current?.slidePrev(),
                          className: arrowClass('prev', !loop && isBeginning),
                      })
                    : null}
                {showArrows && nextArrow && isValidElement(nextArrow)
                    ? cloneElement(nextArrow, {
                          onClick: () => swiperRef.current?.slideNext(),
                          className: arrowClass('next', !loop && isEnd),
                      })
                    : null}
            </div>
        )
    }
)

SlickToSwiper.displayName = 'SlickToSwiper'

export default SlickToSwiper
