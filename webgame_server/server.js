
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const e = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const dataFilePath = path.join(__dirname, 'data.json');
var username_logged = "";

app.get('/', (req, res) => {
    res.json({ message: "New Explorer!" });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Read the data.json file
    fs.readFile(dataFilePath, (err, data) => {
        if (err) {
            console.error("Error reading data file:", err);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }

        // Parse the JSON data
        const userData = JSON.parse(data);

        // Check if the provided username exists in the JSON data
        if (!userData[username]) {
            return res.status(401).json({ success: false, message: "Invalid Username" });
        }

        // Check if the provided password matches the stored password for the username
        if (userData[username].password !== password) {
            return res.status(401).json({ success: false, message: "Invalid Password" });
        }

        username_logged = username;

        // Authentication successful
        res.json({ success: true, message: "Authentication Successful!" });
    });
});


app.post('/register', (req, res) => {
    const { username, password, age } = req.body;

    // Read the data.json file
    fs.readFile(dataFilePath, (err, data) => {
        if (err) {
            console.error("Error reading data file:", err);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }

        // Parse the JSON data
        let userData = {};
        try {
            userData = JSON.parse(data);
        } catch (error) {
            console.error("Error parsing JSON data:", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }

        // Check if the username already exists
        if (userData[username]) {
            return res.status(400).json({ success: false, message: "Username Already Exists" });
        }

        // Add the new username and password to the userData object
        userData[username] = { password, age, score:0 };

        // Write the updated userData object back to data.json
        fs.writeFile(dataFilePath, JSON.stringify(userData, null, 2), (err) => {
            if (err) {
                console.error("Error writing data to file:", err);
                return res.status(500).json({ success: false, message: "Internal Server Error" });
            }
            console.log("User registered successfully:", username);
            res.json({ success: true, message: "User Registered Successfully!" });
        });
    });
});

app.get('/logout', (req, res) => {
    if (username_logged !== '') {
        console.log(username_logged);
        res.json({success: true,  message: "Still Logged In."})
    }
    else {
        res.json({ success: false, message: "Logout Successful!" });
    }
    
});

app.post('/logout', (req, res) => {
    const success = req.body;
    if (success) {
        username_logged = '';
    }
    
});

app.get('/profile', (req, res) => {
    fs.readFile(dataFilePath, (err, data) => {
        if (err) {
            console.error("Error reading data file:", err);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }

        const userData = JSON.parse(data);
        const user = userData[username_logged];

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const { age, score, hanoi, numberpuzzle, eightqueen } = user;
        // console.log("User profile retrieved successfully:", username_logged, age, score, eightqueen, hanoi, numberpuzzle);

        res.json({ message: "Why fit in when you were born to stand out!", username: username_logged, age: age, score:score, hanoi:hanoi, numberpuzzle:numberpuzzle, eightqueen:eightqueen});
    });
});

app.post('/profile', (req, res) => {
    // Extract the totalPoints data from the request body
    const { totalPoints } = req.body;

    // Read the data.json file
    fs.readFile(dataFilePath, (err, data) => {
        if (err) {
            console.error("Error reading data file:", err);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }

        // Parse the JSON data
        let userData = {};
        try {
            userData = JSON.parse(data);
        } catch (error) {
            console.error("Error parsing JSON data:", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
        if (userData[username_logged]) {
            userData[username_logged].score = totalPoints;
        } else {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Write the updated userData object back to data.json
        fs.writeFile(dataFilePath, JSON.stringify(userData, null, 2), (err) => {
            if (err) {
                console.error("Error writing data to file:", err);
                return res.status(500).json({ success: false, message: "Internal Server Error" });
            }
            console.log("User score updated successfully:", username_logged);
            res.json({ success: true, message: "User score updated successfully" });
        });
    });
});


app.post('/game', (req, res) => {
    const { winner } = req.body;
    if (winner === 'X' || winner === 'O') {
        // Do something with the winner data, e.g., save it to a file
        console.log(`Winner: ${winner}`);
        res.json({ success: true, message: "Winner data received successfully" });
    } else {
        res.status(400).json({ success: false, message: "Invalid winner data" });
    }
});

// app.post('/memorygame', (req, res) => {
//     const { rightMatches, wrongMatches } = req.body;
//     console.log('Received right matches:', rightMatches);
//     console.log('Received wrong matches:', wrongMatches);

//     var score = rightMatches*2 - wrongMatches;

//     res.status(200).send({score});
// });

app.post('/memorygame', (req, res) => {
    const { rightMatches, wrongMatches } = req.body;
    const username = username_logged; // Assuming you have user information available in req.user
    var score = rightMatches*2 - wrongMatches;
    // Read the existing JSON file
    fs.readFile(dataFilePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send({ error: 'Internal server error' });
        }
        let users = JSON.parse(data);
        // console.log('Parsed users:', users); // Debug statement
        if (users[username]) {
            users[username].memory = score;
        } else {
            // If the username doesn't exist, create a new entry
            users[username] = { memory: score };
        }
        // console.log('Updated users:', users); // Debug statement
        fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send({ error: 'Internal server error' });
            }
            console.log('Score updated successfully for', username);
            res.status(200).send({ score: users[username].score });
        });
    });
});

app.post('/numberpuzzle', (req, res) => {
    const { moves, timeTaken } = req.body;
    const username = username_logged; // Assuming you have user information available in req.user
    var score = moves*2 - timeTaken;
    // Read the existing JSON file
    fs.readFile(dataFilePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send({ error: 'Internal server error' });
        }
        let users = JSON.parse(data);
        // console.log('Parsed users:', users); // Debug statement
        if (users[username]) {
            users[username].numberpuzzle = score;
        } else {
            // If the username doesn't exist, create a new entry
            users[username] = { numberpuzzle: score };
        }
        // console.log('Updated users:', users); // Debug statement
        fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send({ error: 'Internal server error' });
            }
            console.log('Score updated successfully for', username);
            res.status(200).send({ score: users[username].score });
        });
    });
});

app.post('/hanoi', (req, res) => {
    const { moves, timeTaken } = req.body;
    const username = username_logged; // Assuming you have user information available in req.user
    var score = moves*2 - timeTaken;
    // Read the existing JSON file
    fs.readFile(dataFilePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send({ error: 'Internal server error' });
        }
        let users = JSON.parse(data);
        // console.log('Parsed users:', users); // Debug statement
        if (users[username]) {
            users[username].hanoi = score;
        } else {
            // If the username doesn't exist, create a new entry
            users[username] = { hanoi: score };
        }
        // console.log('Updated users:', users); // Debug statement
        fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send({ error: 'Internal server error' });
            }
            console.log('Score updated successfully for', username);
            res.status(200).send({ score: users[username].score });
        });
    });
});

app.post('/EightQueen', (req, res) => {
    const { queensPlaced } = req.body;
    const username = username_logged; // Assuming you have user information available in req.user
    // Read the existing JSON file
    fs.readFile(dataFilePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send({ error: 'Internal server error' });
        }
        let users = JSON.parse(data);
        // console.log('Parsed users:', users); // Debug statement
        if (users[username]) {
            users[username].eightqueen = queensPlaced * 2;
        } else {
            // If the username doesn't exist, create a new entry
            users[username] = { eightqueen: queensPlaced * 2 };
        }
        // console.log('Updated users:', users); // Debug statement
        fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send({ error: 'Internal server error' });
            }
            console.log('Score updated successfully for', username);
            res.status(200).send({ score: users[username].score });
        });
    });
});


app.listen(8000, () => {
    console.log(`Server is running on port 8000.`);
});
