// Import necessary modules
const express = require('express'); // Express for handling HTTP requests and routing
const bcrypt = require('bcrypt'); // Bcrypt for securely hashing passwords
const { PrismaClient } = require('@prisma/client'); // Prisma client for interacting with the database

const router = express.Router(); // Create a new router object to define route handlers
const prisma = new PrismaClient(); // Instantiate a new Prisma client to access the database

// POST /signup - Route for user registration
router.post('/signup', async (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    try {
        // Check if a user with this email already exists in the database
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
        // If a user is found, return a 400 error to prevent duplicate accounts
        return res.status(400).json({ error: 'Email already in use.' });
        }

        // Hash the user's password using bcrypt for secure storage
        // The second argument (10) is the salt rounds, balancing security and performance
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user in the database with the hashed password
        const user = await prisma.user.create({
            data: {
                //save email and password of user
                email,
                password: hashedPassword,
                // create basic stats and info of starting character
            character: {
                create: {
                    name: "Roland Stoneheart",
                    level: 1,
                    species: "Human",
                    xp: 0,
                    strength: 1,
                    weapon: "Sword",
                    health: 100,
                    mana: 50,
                    },
                },
            },
            include: {
            character: true, // include character in the response
            },
        });

    // Respond with success, include the new user's ID (do not include sensitive data like password) and character info
    res.status(201).json({ message: 'User created!', userId: user.id, character: user.character});
    } catch (err) {
        // Log any unexpected error to the server console for debugging
        console.error(err);
        // Return a generic error response to the client
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

// Export the router so it can be used in other parts of the app
module.exports = router;

// POST /login User login
router.post('/login', async (req, res) =>{
    const { email, password } = req.body;

    try{
        // Look up the user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { character: true }, // include character info
        });

        // If user doesn't exist throw invalid email or password error
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        // Compare password using bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            // if password doesnt match throw invalid email or passowrd error
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        // login was successfull 
        res.status(200).json({
            message: 'Login successful!',
            userId: user.id,
            character: user.character,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong during login.' });
    }
});

// Export router
module.exports = router;