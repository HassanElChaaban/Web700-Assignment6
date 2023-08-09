/*********************************************************************************
* WEB700 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Hassan ElCHaaban Student ID: 146849229 Date: July 27, 2023
* Online (Cyclic) Link: https://cloudy-fly-umbrella.cyclic.app
*
********************************************************************************/
var HTTP_PORT = process.env.PORT || 8080;
var path = require("path");
var express = require("express");
const bodyParser = require('body-parser');
var app = express();
var collegeData = require("./modules/collegedata.js");
const exphbs = require('express-handlebars');

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
    });


app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers: { 
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
            '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
            },
            equal: function (lvalue, rvalue, options) {
                if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
                if (lvalue != rvalue) {
                return options.inverse(this);
                } else {
                return options.fn(this);
                }
                }
    }
}));
app.set('view engine', '.hbs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));








app.get("/addStudent", (req, res) => {
  collegeData.getCourses().then((courses) => {
    res.render('addStudent', { courses: courses });
  }).catch(() => {
    res.render('addStudent', { courses: [] });
  });
});
  
  app.post('/students/add', (req, res) => {
    collegeData.addStudent(req.body).then(() => {
      res.redirect('/students');
    }).catch((err) => {
      console.log(err);
      res.status(500).send('Error adding student');
    });
  });
  app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
      .then(() => {
        res.redirect("/students");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error updating student");
      });
  });
  app.get("/students", function(req,res){
    collegeData.getAllStudents()
        .then((data) => {
            if (data.length > 0) {
                res.render("students", {students:data});
            } else {
                res.render("students",{ message: "no results" });
            }
        })
        .catch((err) => {
            res.render("students",{ message: err });
        });
});

app.get("/courses", function(req,res){
    collegeData.getCourses()
        .then((data) => {
            if (data.length > 0) {
                res.render("courses", {courses:data});
            } else {
                res.render("courses",{ message: "no results" });
            }
        })
        .catch((err) => {
            res.render("courses",{ message: err });
        });
});

app.get("/student/:studentNum", (req, res) => {
  // initialize an empty object to store the values
let viewData = {};
collegeData.getStudentByNum(req.params.studentNum).then((data) => {
if (data) {
viewData.student = data; //store student data in the "viewData" object as "student"
} else {
viewData.student = null; // set student to null if none were returned
}
}).catch(() => {
viewData.student = null; // set student to null if there was an error
}).then(collegeData.getCourses).then((data) => {
  viewData.courses = data; // store course data in the "viewData" object as "courses"
// loop through viewData.courses and once we have found the courseId that matches
// the student's "course" value, add a "selected" property to the matching
// viewData.courses object
for (let i = 0; i < viewData.courses.length; i++) {
if (viewData.courses[i].courseId == viewData.student.course) {
  viewData.courses[i].selected = true;
}
}
}).catch(() => {
viewData.courses = []; // set courses to empty if there was an error
}).then(() => {
if (viewData.student == null) { // if no student - return an error
  res.status(404).send("Student Not Found");
} else {
  console.log(viewData.student)
  res.render("student", { viewData: viewData }); // render the "student" view
}
});
});


app.get("/course/:id", (req, res) => {
  collegeData.getCourseById(req.params.id)
  .then(function (data) {   
      res.render("course", { course: data });
  })
  .catch(function (reason) {
      res.status(404).send("Course Not Found");
  });
});


app.get('/addCourse', (req, res) => {
  res.render('addCourse');
});

app.post('/courses/add', (req, res) => {
  const newCourseData = {
    courseCode: req.body.courseCode,
    courseDescription: req.body.courseDescription,
  };

  collegeData.addCourse(newCourseData)
        .then(() => {
          res.redirect('/courses');
        })
        .catch((error) => {
          console.error('Error:', error);
          res.render('addCourse', { message: 'Error adding course' });
        });
    
});


app.post("/course/update", (req, res) => {
  collegeData.updateCourse(req.body).then(
      res.redirect('/courses')
  ).catch(function(reason){
      console.log(reason);
  });
});

app.get('/course/delete/:id', (req, res) => {
  const courseId = parseInt(req.params.id);
  
  collegeData.deleteCourseById(courseId)
      .then(() => {
          res.redirect('/courses');
      })
      .catch((error) => {
          console.error('Error:', error);
          res.status(500).send('Unable to Remove Course / Course not found');
      });
    
});
  app.get('/', (req, res) => {
    res.render('home'); // Render the "home" view using handlebars template
  });
  

app.get("/about", (req, res) => {
res.render('about');
});

app.get("/htmlDemo", (req, res) => {
    res.render('htmlDemo');
});

app.get('/student/delete/:studentNum', (req, res) => {
  const studentNum = parseInt(req.params.studentNum); 
  collegeData.deleteStudentByNum(studentNum)
      .then(() => {
          res.redirect('/students');
      })
      .catch(() => {
          res.status(500).send('Unable to Remove Student / Student not found');
      });
});

app.use((req, res) => {
    res.status(404).send("404 Page Not Found");
});




collegeData.initialize().then(() => {


app.listen(HTTP_PORT, ()=>{console.log("server listening on port: " + HTTP_PORT)});
}).catch((err) => {
    console.log(err);
}
);
