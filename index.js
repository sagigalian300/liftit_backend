const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const corsOptions = {
  origin: [
    "https://prismatic-queijadas-0e8da0.netlify.app", // netfliy
    "http://localhost:3000",
    "https://liftit-380a1.web.app", //firebase hosting
  ],
  allowedHeaders: ["Content-Type"],
  exposedHeaders: ["Access-Control-Allow-Origin"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

const app = express();
app.use(cors(corsOptions));
require("dotenv").config();

const PORT = 3001 || process.env.PORT;

const uri = process.env.MONGODB_KEY;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const collection = client.db("liftit").collection("users");

app.post('/forgotPassword', (req, res) => {
  const email = req.query.email;

  collection.findOne({ email }).then(result => {
    console.log(result)
    if (result != null){
      collection.updateOne(
        { _id: new ObjectId("643e77a1eac670cf0511f5c1")},
        { $push: { passwords: email.toString() } },
      ).then(result => {
        console.log(result)
        res.send('email exists')
      }).catch(err => {
        console.error(err);
       
      })
    }else {
      res.send('email does not exists')
      console.log('email does not exists')
    }
  })
  
})

app.post('/renameAccount', (req, res) => {
  const accountId = req.query.accountId;
  const newName = req.query.newName;

  collection.updateOne({_id: new ObjectId(accountId)}, {
    $set: {name: newName}
  }).then(result => {
    console.log("Successfuly updated the name for id - " + accountId)
    res.send("Successfuly updated the name for id - " + accountId)
  }).catch((err) => {
    console.error(err)
    res.send('Could not change the Name for - ' + accountId)
  })
})

app.post('/updateEmail', (req, res) => {
  const accountId = req.query.accountId;
  const newEmail = req.query.newEmail;

  collection.updateOne({_id: new ObjectId(accountId)}, {
    $set: {email: newEmail}
  }).then(result => {
    console.log("Successfuly updated the email for id - " + accountId)
    res.send("Successfuly updated the email for id - " + accountId)
  }).catch((err) => {
    console.error(err)
    res.send('Could not change the email for - ' + accountId)
  })
})

app.post('/changeAccountPassword', (req, res) => {
  const accountId = req.query.accountId;
  const newPassword = req.query.newPassword;

  collection.updateOne({_id: new ObjectId(accountId)}, {
    $set: {password: newPassword}
  }).then(result => {
    console.log("Successfuly updated the password for id - " + accountId)
    res.send("Successfuly updated the password for id - " + accountId)
  }).catch((err) => {
    console.error(err)
    res.send('Could not change the password for - ' + accountId)
  })
})

app.get("/getExercises", (req, res) => {
  const accountId = req.query.accountId;
  const muscleId = req.query.muscleId;

  collection.findOne({ _id: new ObjectId(accountId) }).then((result) => {
    const muscle = result.muscles.find(
      (obj) => obj.muscleId === Number(muscleId)
    );
    res.send(muscle);
  });
});

app.get("/getExercise", (req, res) => {
  const accountId = req.query.accountId;
  const muscleId = req.query.muscleId;
  const exerciseId = req.query.exerciseId;

  collection.findOne({ _id: new ObjectId(accountId) }).then((result) => {
    const muscle = result.muscles.find(
      (obj) => obj.muscleId === Number(muscleId)
    );
    const exercise = muscle.muscleExercises.find(
      (obj) => obj.exerciseId === Number(exerciseId)
    );
    res.send(exercise);
  });
});

app.post("/deleteWorkout", (req, res) => {
  const accountId = req.query.accountId;
  const muscleId = req.query.muscleId;
  const exerciseId = req.query.exerciseId;
  const workoutId = req.query.workoutId;

  collection
    .updateOne(
      {
        _id: new ObjectId(accountId),
        "muscles.muscleId": Number(muscleId),
        "muscles.muscleExercises.exerciseId": Number(exerciseId),
      },
      {
        $pull: {
          "muscles.$.muscleExercises.$[exercise].workouts": {
            workoutId: workoutId,
          },
        },
      },
      { arrayFilters: [{ "exercise.exerciseId": Number(exerciseId) }] }
    )
    .then((result) => {
      console.log(`Deleted ${result.modifiedCount} workout(s)`);
      res.send("Workout deleted");
    })
    .catch((error) => {
      console.log(error);
    });
});

app.post("/addWorkout", (req, res) => {
  const accountId = req.query.accountId;
  const muscleId = req.query.muscleId;
  const exerciseId = req.query.exerciseId;
  const weights = req.query.weights;
  const reps = req.query.reps;
  const workoutId = req.query.workoutId;

  collection
    .updateOne(
      {
        _id: new ObjectId(accountId),
        "muscles.muscleId": Number(muscleId),
        "muscles.muscleExercises.exerciseId": Number(exerciseId),
      },
      {
        $push: {
          "muscles.$.muscleExercises.$[exercise].workouts": {
            sets: { weights: weights, reps: reps },
            date: Date.now(),
            workoutId: workoutId,
          },
        },
      },
      { arrayFilters: [{ "exercise.exerciseId": Number(exerciseId) }] }
    )
    .then((result) => {
      console.log(result);
      res.send("succsess");
    });
});

// app.get('/getWorkouts', (req, res) => {
//   const accountId = req.query.accountId;
//   const muscleId = req.query.muscleId;
//   const exerciseId = req.query.exerciseId;

//   collection.findOne(
//     { _id: new ObjectId(accountId), "muscles.muscleId": Number(muscleId), "muscles.muscleExercises.exerciseId": Number(exerciseId) },
//     { "muscles.$": 1, "muscles.muscleExercises.$": 1, "muscles.muscleExercises.$.workouts": 1 }
//   ).then(result => {
//     console.log(result)
//     res.send(result.muscles)
//   })

// })

app.post("/deleteExercise", (req, res) => {
  const accountId = req.query.accountId;
  const muscleId = req.query.muscleId;
  const exerciseId = req.query.exerciseId;

  collection
    .updateOne(
      { _id: new ObjectId(accountId), "muscles.muscleId": Number(muscleId) },
      {
        $pull: {
          "muscles.$.muscleExercises": { exerciseId: Number(exerciseId) },
        },
      }
    )
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/updateWorkout", (req, res) => {
  const accountId = req.query.accountId;
  const muscleId = req.query.muscleId;
  const workoutId = req.query.workoutId;
  const exerciseId = req.query.exerciseId;
  const newWeights = req.query.newWeights;
  const newReps = req.query.newReps;

  collection
    .updateOne(
      {
        _id: new ObjectId(accountId), // replace <id> with the value of _id
        "muscles.muscleId": Number(muscleId), // replace <muscleId> with the value of muscleId
        "muscles.muscleExercises.exerciseId": Number(exerciseId), // replace <exerciseId> with the value of exerciseId
        "muscles.muscleExercises.workouts.workoutId": workoutId, // replace <workoutId> with the value of workoutId
      },
      {
        $set: {
          "muscles.$[muscle].muscleExercises.$[exercise].workouts.$[workout].sets.weights":
            newWeights, // replace [10, 20, 30] with the new weights array
          "muscles.$[muscle].muscleExercises.$[exercise].workouts.$[workout].sets.reps":
            newReps, // replace [8, 10, 12] with the new reps array
        },
      },
      {
        arrayFilters: [
          { "muscle.muscleId": Number(muscleId) }, // replace <muscleId> with the value of muscleId
          { "exercise.exerciseId": Number(exerciseId) }, // replace <exerciseId> with the value of exerciseId
          { "workout.workoutId": workoutId }, // replace <workoutId> with the value of workoutId
        ],
      }
    )

    .then((result) => {
      res.send(`Workout with id of - ${workoutId} has been updated.`);
      console.log(result);
    })
    .catch((err) => {
      res.send("Could not update the workout.");
    });
});

app.post("/renameMuscle", (req, res) => {
  const accountId = req.query.accountId;
  const muscleId = req.query.muscleId;
  const newName = req.query.newName;

  collection
    .updateOne(
      { _id: new ObjectId(accountId), "muscles.muscleId": Number(muscleId) },
      { $set: { "muscles.$.muscleName": newName } }
    )
    .then((result) => {
      console.log("muscle name changed");
      res.send("Muscle name changed !");
    })
    .catch((err) => {
      console.log(err);
      res.send("Could not change the name of the muscle");
    });
});

app.post("/renameExercise", (req, res) => {
  const accountId = req.query.accountId;
  const muscleId = req.query.muscleId;
  const exerciseId = req.query.exerciseId;
  const newName = req.query.newName;

  collection
    .updateOne(
      {
        _id: new ObjectId(accountId),
        "muscles.muscleId": Number(muscleId),
        "muscles.muscleExercises.exerciseId": Number(exerciseId),
      },
      {
        $set: {
          "muscles.$[m].muscleExercises.$[e].exerciseName": newName,
        },
      },
      {
        arrayFilters: [
          { "m.muscleId": Number(muscleId) },
          { "e.exerciseId": Number(exerciseId) },
        ],
      }
    )
    .then((result) => {
      res.send("Updated the exercise name");
    })
    .catch((err) => {
      res.send("Could not update the exercise name");
    });
});

app.post("/addExerciseToMuscle", (req, res) => {
  const accountId = req.query.accountId;
  const muscleId = req.query.muscleId;
  const exerciseName = req.query.exerciseName;
  const exerciseId = req.query.exerciseId;

  collection
    .updateOne(
      {
        _id: new ObjectId(accountId),
        "muscles.muscleId": Number(muscleId),
      },
      {
        $push: {
          "muscles.$.muscleExercises": {
            exerciseName: exerciseName,
            exerciseId: Number(exerciseId),
            workouts: Array(),
          },
        },
      }
    )
    .then((result) => {
      console.log(result);
      res.send("Exercise Added");
    })
    .catch((err) => {
      console.log(err);
      res.send("Could not add exercise");
    });
});
app.post("/addmuscle", (req, res) => {
  const accountId = req.query.accountId;
  const muscleName = req.query.muscleName;
  const muscleId = req.query.muscleId;

  collection
    .updateOne(
      { _id: new ObjectId(accountId) },
      {
        $push: {
          muscles: {
            muscleId: Number(muscleId),
            muscleName: muscleName,
            muscleExercises: Array(),
          },
        },
      }
    )
    .then((result) => {
      res.send("Added muscle");
    })
    .catch((err) => {
      res.send("Could not add muscle");
    });
});
app.post("/removeMuscle", (req, res) => {
  const accountId = req.query.accountId;
  const muscleId = Number(req.query.muscleId);

  collection
    .updateOne(
      { _id: new ObjectId(accountId) },
      { $pull: { muscles: { muscleId: muscleId } } }
    )
    .then((result) => {
      res.send("Deleted muscle");
    })
    .catch((err) => {
      res.send("Could not delete muscle");
    });
});

app.get("/changeNotified", (req, res) => {
  const accountId = req.query.accountId;

  collection
    .updateOne(
      { _id: new ObjectId(accountId) },
      {
        $set: { notified: true },
      }
    )
    .then((result) => {
      res.send("notified updated");
    })
    .catch(() => {
      res.send("could not change the notified field");
    });
});
app.get("/getUpdates", (req, res) => {
  collection
    .findOne({ _id: new ObjectId(process.env.UPDATES_ID) })
    .then((result) => {
      res.send(result.updates);
      // console.log(result.updates);
    });
});
app.post("/activeAccount", (req, res) => {
  const accountId = req.query.accountId;

  collection
    .updateOne({ _id: new ObjectId(accountId) }, { $set: { date: new Date() } })
    .then(() => {
      console.log("Account actived =>", accountId);
      res.send("Account actived");
    })
    .catch((err) => {
      console.log("Error", err);
      res.send("could not active account => ", accountId);
    });
});

app.post("/changeFreeTrial", (req, res) => {
  const accountId = req.query.accountId;
  collection
    .updateOne(
      { _id: new ObjectId(accountId) },
      { $set: { inTrial: false, date: new Date() } }
    )
    .then(() => {
      res.send("No more in Trial");
      console.log("No more in Trial for ->", accountId);
    })
    .catch((err) => {
      console.log("Error", err);
      res.send("could not change inTrial field");
    });
});

app.post("/createAccount", (req, res) => {
  const name = req.query.name;
  const password = req.query.password;
  const email = req.query.email;
  const type = req.query.type;

  collection
    .insertOne({
      name: name,
      password: password,
      email: email,
      muscles: Array(),
      notified: false,
      premium: false,
      date: new Date(),
      inTrial: true,
      type,
      trainers: Array(),
    })
    .then((result) => {
      res.send("Success");
    })
    .catch((err) => {
      res.send("Error");
    });
});
app.get("/getAccountDetails", (req, res) => {
  const accountId = req.query.accountId;

  collection
    .findOne({ _id: new ObjectId(accountId) })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send("Could not get user Info");
    });
});
app.get("/checkAccount", (req, res) => {
  const name = req.query.name;
  const password = req.query.password;

  collection
    .findOne({
      name: name,
      password: password,
    })
    .then((result) => {
      res.send(result);
      console.log(result);
    })
    .catch((err) => {
      res.send("User doesnt exist");
      console.log(err);
    });
});

app.post("/addtrainer", (req, res) => {
  const accountId = req.query.accountId;
  const trainer_id = req.query.trainer_id;
  const trainer_name = req.query.trainer_name;

  collection
    .updateOne(
      { _id: new ObjectId(accountId)},
      {
        $push: {
          trainers: {trainer_name, trainer_id},
        },
      }
    )
    .then((result) => {
      res.send("Added trainer");
    })
    .catch((err) => {
      res.send("Could not add trainer");
    });
});

app.listen(PORT, () => {
  console.log(`[RUNNING] on port: ${PORT}`);
});
