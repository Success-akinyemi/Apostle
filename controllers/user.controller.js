import UserModel from "../model/User.js"

export async function getUsers(req, res) {
    try {
        const users = await UserModel.find().select('-password')

        res.status(200).json({ success: true, data: users })
    } catch (error) {
        console.log('UNABLE TO GET ALL USERS', error)
        res.status(500).json({ success: false, data: 'Unable to get users' })
    }
}

export async function getUser(req, res) {
    const { id } = req.params
    try {
        const user = await UserModel.findById({ _id: id }).select('-password')
        if(!user){
            return res.status(404).json({ success: false, data: 'User does not exist' })
        }

        res.status(200).json({ success: true, data: user })
    } catch (error) {
        console.log('UNABLE TO GET ALL USERS', error)
        res.status(500).json({ success: false, data: 'Unable to get users' })
    }
}