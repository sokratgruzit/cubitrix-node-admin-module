const jwt_decode = require('jwt-decode');

const verify_roles = (...allowed_roles) => {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization || req.headers.Authorization;
    
        if (!authHeader) return res.status(401).json({ "message": "Unauthorized" });
        
        const token = authHeader.split(' ')[1];

        try {
            var decoded = jwt_decode(token);
            
            if (!decoded) return res.status(401).json({ "message": "Unauthorized" });
            
            const roles_array = [...allowed_roles];
            const result = roles_array.includes(decoded.roles);
            
            if (!result) return res.status(401).json({ "message": "Unauthorized" });
        } catch (e) {
            return res.status(401).json({ "message": "Unauthorized" });
        }
        next();
    };
};

module.exports = verify_roles;