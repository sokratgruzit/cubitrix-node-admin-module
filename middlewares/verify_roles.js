const verify_roles = (...allowed_roles) => {
    return (req, res, next) => {
        if (!req?.roles) return res.status(401).json({ "message": "Unauthorized" });
        const roles_array = [...allowed_roles];
        const result = req.roles.map(role => roles_array.includes(role)).find(val => val === true);
        
        if (!result) return res.status(401).json({ "message": "Unauthorized" });
        next();
    };
};

module.exports = verify_roles;