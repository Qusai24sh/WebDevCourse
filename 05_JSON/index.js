
let userObj = {
    username: "Qusai",
    grade: 89,
    password: "pass123",
    isConnected: true,
    address: {
        country: "usa",
        city: "seattle",
        street: "lynwood"
    },
    allgrades: [{ csharp: 90 }, { cpp: 90 }, 90, 88]
}

let newGrade = userObj.grade + 10;
userObj.grade += 10;
userObj.id = 1000;

let userObj2 = userObj;
userObj.grade += 10;
userObj2.grade = 0;
let grade1 = userObj.grade;

let arr = [userObj, {
    username: "yan",
    grade: 89,
    password: "pass123",
    isConnected: true,
    address: {
        country: "usa",
        city: "seattle",
        street: "lynwood"
    },
    allgrades: [{ csharp: 90 }, { cpp: 90 }, 90, 88]
}]

arr[0].allgrades[1] = { CPP: 80 };
arr[1].avg = 95;

let user2 = arr[1];
user2.password = "12345";