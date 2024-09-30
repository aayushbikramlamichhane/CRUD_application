const express = require('express');
const router = express.Router();
const User = require('../models/user.models.js');
const multer = require('multer');
const fs = require('fs');
// const { resolve6 } = require('dns/promises');
const path = require('path');

// image upload
let storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads');
    },
    filename: function(req, file, cb){
        cb(null, file.filename + "_" + Date.now() + "_" + file.originalname);
    }
});

let upload = multer({
    storage: storage,
}).single('image');

// inserting user into db route
router.post('/add', upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file ? req.file.filename : ''
        });

        await user.save();

        req.session.message = {
            type: 'success',
            message: 'User added successfully!'
        };

        res.redirect('/');
    } catch (err) {
        console.error('Error adding user:', err);
        res.json({ message: err.message, type: 'danger' });
    }
});

router.get("/", async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render('index', {
        title: 'Home Page',
        users: users
        });
    } catch (err) {
        res.json({
        message: err.message
        });
    }
});

router.get('/add', (req, res) => {
    res.render('add_users', { title : 'Add Users'});
});

// edit 
router.get('/edit/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.redirect('/');
        }
        res.render('edit_users', {
            title: 'Edit User',
            user: user
        });
    } catch (err) {
        res.redirect('/');
    }
});

router.post('/update/:id', upload, async (req, res) => {
    const id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            const oldImagePath = path.join(__dirname, 'uploads', req.body.old_image);
            fs.unlinkSync(oldImagePath);
        } catch (error) {
            console.log('Error deleting old image:', error);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        const result = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image
        });

        if (!result) {
            return res.status(404).json({ message: 'User not found', type: 'danger' });
        }
        req.session.message = {
            type: 'success',
            message: 'User updated successfully'
        };
        res.redirect('/');
    } catch (err) {
        console.error('Error updating user:', err);
        res.json({ message: err.message, type: 'danger' });
    }
});

// delete user

router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.json({ message: 'User not found' });
        }

        if (user.image && user.image !== '') {
            const imagePath = path.join(__dirname, 'uploads', user.image);
            try {
                fs.unlinkSync(imagePath);
            } catch (error) {
                console.error('Error deleting image file:', error);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'User deleted successfully'
        };
        res.redirect('/');
    } catch (err) {
        console.error('Error deleting user:', err);
        res.json({ message: err.message });
    }
});

module.exports = router;