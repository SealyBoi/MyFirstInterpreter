# MyFirstInterpreter
The goal of this project was to introduce myself back into the world of interpreters

This is a very small interpreter that supports simple variables like strings, booleans, numbers, and null values. It can store functions that perform basic mathematic operations and has a built-in print statement. It can be run by either reading from a chosen file, or by running the command line prompt. If I continue to work on this in the future, I will likely attempt adding basic if statements, for loops, while loops.

To run the project you will need to install Deno and enable it in your workspace (I used VSCode for this) after you clone the repo. Once that is installed and enabled for the project you can use the following command to run the program:
> deno run -A main.ts

> If you would like to run the program in the CLI, simply leave the code as is. If you would like to checkout the script reader though, head into main.ts and comment out 'repl();' and uncomment 'run("./test.txt");'. Change the code in test.txt to run your own code instead!

To assign variables, use the 'let' or 'const' keywords:
```
let x = 45;
const y = 55;
```

Const variables cannot be changed after initialization, while let variables can:
```
let x = 1;
x = 5;
```

The data types supported are strings, booleans, and numbers:
* String: let x = "hello";
* Boolean: let x = true;
* Number: let x = 5;

You can also create functions using the following syntax:
```
fn addTwo (x, y) {
    x + y
}
```
The last value stated at the end of a function is what will be returned when the function finishes executing.

There are also two pre-defined functions in the environment:
* print(): prints all parameters listed
* time(): returns current time in milliseconds

An example script/program for you to write could be as follows:
```
    fn addTwo (x, y) {
        x + y
    }

    let x = 15;
    let y = 15;
    print(addTwo(x, y))
```

Most importantly, comments are done by using the #:
> \# This is a comment! #

This isn't the coolest way to do comments, but in the manner that I read the file it's the easiest.

If anything isn't stated here that you still need help with feel free to reach out and let me know!
