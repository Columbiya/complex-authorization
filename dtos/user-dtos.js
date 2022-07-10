class UserDto {
    email;
    id;
    isActivated;

    constructor(model) {
        this.email = model.email
        this.id = model._id
        this.isActivated = model.isActivated
    }
}

//DTO - Data Transfer Object

export default UserDto