interface AdminModel {
    name: string;
    email: string;
    pfp: string; // Profile picture URL or path
    role: string; // e.g., "admin", "sub-admin"
}

// Default instance of AdminModel
const defaultAdminModel: AdminModel = {
    name: "",
    email: "",
    pfp: "",
    role: ""
};

export default defaultAdminModel;
