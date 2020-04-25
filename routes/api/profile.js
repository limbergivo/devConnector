const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator')


//Models
const Profile = require('../../models/Profile')
const User = require('../../models/Users')

//@route  GET api/profile/me
//@desc   GET current users profiles 
//@acces  Private 
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', [
            'name',
            'avatar'
        ]);

        if (!profile) {
            return res.status(400).json({ msg: " There is no profile for this user " })
        }

        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
}
);

//@route  POST api/profile
//@desc    Create or update  users profiles 
//@acces  Private 


router.post('/', [auth, [
    check('status', ' Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        //De verschillende velden eruit halen met destructering methode
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        //build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        //build social object
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin = linkedin;

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                //update
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );

                return res.json(profile);
            }

            //Create profile 
            profile = new Profile(profileFields);

            await profile.save()
            res.json(profile)

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }

    })


//@route  GET api/profile
//@desc   Get all profiles
//@acces  public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})


//@route  GET api/profile/user/:user_id
//@desc   Get  profile by user ID
//@acces  public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id })
            .populate('user', ['name', 'avatar']);
        if (!profile) return res.status(400).json({ msg: "Profile not found" })
        res.json(profile);
    } catch (err) {
        console.error(err.message)
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: "Profile not found" })
        }
        res.status(500).send('Server Error')
    }
})


//@route  DELETE api/profile/
//@desc   Delete  profile, user & posts
//@acces  private
router.delete('/', auth, async (req, res) => {
    try {
        //@todo - remove users posts
        //remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        //remove user
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message)
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: "Profile not found" })
        }
        res.status(500).send('Server Error')
    }
})


//@route  put api/profile/experience
//@desc   Add profile experience
//@acces  private


router.put('/experience', [auth], [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp);

        await profile.save()


        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})




//@route  DELETE api/profile/experience/:exp_id
//@desc   Delete   experience from profile
//@acces  private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        //Get index to remove item
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

        // Using splice to remove the item from the profile
        profile.experience.splice(removeIndex, 1)

        await profile.save()

        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})



//@route  put api/profile/education
//@desc   Add profile education
//@acces  private


router.put('/education', [auth], [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift(newEdu);

        await profile.save()


        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})




//@route  DELETE api/profile/education/:edu_id
//@desc   Delete   education from profile
//@acces  private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        //Get index to remove item
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)

        // Using splice to remove the item from the profile
        profile.education.splice(removeIndex, 1)

        await profile.save()

        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})



module.exports = router;