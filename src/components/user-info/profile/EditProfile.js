import BasicInformation from './BasicInformation'

const EditProfile = ({ data, refetch, deleteUserHandler }) => {
    return (
        <BasicInformation
            data={data}
            refetch={refetch}
            deleteUserHandler={deleteUserHandler}
        />
    )
}

export default EditProfile
