const fs = require('fs');
const path = require('path');

const cache = {
  'introduction to java': `# Introduction to Java: Complete Beginner Guide

## What is Java?
Java is one of the world's most popular, high-level, class-based, object-oriented programming languages. Created by **James Gosling** at Sun Microsystems in 1995 (now owned by Oracle), Java was designed with the core philosophy of **WORA (Write Once, Run Anywhere)**.

### Why Learn Java?
- **Platform Independence**: Java code compiles into platform-neutral bytecode (.class) which runs on any system with a Java Virtual Machine (JVM).
- **Object-Oriented**: Promotes clean, modular code through concepts like Encapsulation, Inheritance, Polymorphism, and Abstraction.
- **Massive Ecosystem**: Powers enterprise software, Android mobile apps, large-scale backend systems (Spring Boot), big data frameworks (Apache Spark, Hadoop), and cloud services.
- **Robust & Secure**: Automatic garbage collection, strong type checking, and lack of explicit pointers prevent memory corruption and buffer overflow bugs.

### How Java Works
1. **Source Code (.java)**: You write readable Java code in a text editor or IDE.
2. **Compiler (javac)**: The compiler turns your code into platform-independent Bytecode (.class).
3. **Java Virtual Machine (JVM)**: Executes the bytecode on your specific operating system (Windows, Mac, Linux).

\`\`\`java
// Your first Java code
public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to Java Programming!");
    }
}
\`\`\`
`,

  'features of java': `# Key Features of Java

Java's immense popularity is driven by its foundational design characteristics, often known as the **Java Buzzwords**:

### 1. Simple & Familiar
Java syntax is clean and familiar (modeled after C/C++), but eliminates confusing and error-prone features like explicit pointers, operator overloading, and manual memory management.

### 2. Platform Independent (WORA)
Unlike C or C++ which compile to machine-specific code, Java compiles into **Bytecode**. Bytecode is executed by the **JVM**, allowing the exact same program to run seamlessly on Windows, macOS, Linux, and cloud servers.

### 3. Object-Oriented (OOP)
Everything in Java is organized inside classes and objects. This enforces:
- **Modularity**: Breaking problems into reusable components.
- **Maintainability**: Easy updates with reduced side effects.
- **Extensibility**: Adding new functionality via inheritance.

### 4. Robust & Memory Safe
- **Automatic Garbage Collection**: Unused objects are automatically freed from memory, eliminating memory leaks.
- **Exception Handling**: Built-in try-catch mechanism prevents unexpected application crashes.
- **Type Safety**: Strict compile-time checks catch errors early.

### 5. Multithreaded
Java has native support for multithreading, allowing multiple tasks to execute concurrently to fully utilize multi-core modern CPUs.

### 6. Secure
Java code runs inside a secure JVM sandbox with bytecode verification, ensuring untrusted code cannot harm your operating system.
`,

  'java virtual machine (jvm)': `# Understanding the JVM, JRE, and JDK

To master Java, understanding the relationship between the **JVM**, **JRE**, and **JDK** is fundamental:

### 1. JVM (Java Virtual Machine)
The JVM is the engine that actually runs Java bytecode. It performs:
- **Class Loading**: Loads .class files into memory.
- **Bytecode Verification**: Checks code for security violations.
- **JIT Compilation**: Converts bytecode to native machine code on the fly for maximum execution speed.
- **Garbage Collection**: Reclaims unused memory automatically.

### 2. JRE (Java Runtime Environment)
The JRE is the package needed to **run** Java applications. It includes:
- The **JVM**
- Core Java standard libraries and runtime files.

### 3. JDK (Java Development Kit)
The complete software development environment needed to **build and compile** Java programs. It includes:
- The **JRE** + **JVM**
- Development tools: **javac** (compiler), **jdb** (debugger), **jar** (archiver), and documentation tools.

\`\`\`
+---------------------------------------------+
| JDK (Development Kit)                       |
|   +---------------------------------------+ |
|   | JRE (Runtime Environment)             | |
|   |   +-------------------+ +-----------+ | |
|   |   | JVM (Virtual Mach)| | Libraries | | |
|   |   +-------------------+ +-----------+ | |
|   +---------------------------------------+ |
|   javac, debugger, jar, javadoc tools       |
+---------------------------------------------+
\`\`\`
`,

  'setting up java environment (jdk)': `# Setting Up Java Development Environment (JDK)

Follow these quick steps to get Java running on your computer:

### Step 1: Download the JDK
1. Download **Java 17 LTS** or **Java 21 LTS** (from Oracle or Eclipse Temurin OpenJDK).
2. Run the installer and accept default installation paths.

### Step 2: Configure Environment Variables (Windows)
1. Search for **Environment Variables** in the Windows Start menu.
2. Under System Variables, click **New**:
   - Variable name: \`JAVA_HOME\`
   - Variable value: \`C:\\Program Files\\Java\\jdk-21\` (your installed path)
3. Under System Variables, edit \`Path\` and add:
   - \`%JAVA_HOME%\\bin\`

### Step 3: Verify Installation
Open a command prompt or terminal and run:
\`\`\`bash
java -version
javac -version
\`\`\`
If you see version details, Java is ready to go!
`,

  'first java program (hello world)': `# Your First Java Program (Hello World)

Here is the canonical first program in Java with a step-by-step breakdown:

\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

### Line-by-Line Breakdown:
1. **\`public class HelloWorld\`**: Every Java program must have at least one class definition. The file name must match the public class name (\`HelloWorld.java\`).
2. **\`public static void main(String[] args)\`**: The entry point of every standalone Java application.
   - \`public\`: Accessible from anywhere.
   - \`static\`: Can be invoked without creating an instance of the class.
   - \`void\`: Returns no value.
   - \`main\`: The special method name recognized by the JVM.
   - \`String[] args\`: Accepts command-line arguments.
3. **\`System.out.println(...)\`**: Prints the text to the standard console output followed by a new line.

### Compiling and Running:
\`\`\`bash
# 1. Compile to bytecode (.class)
javac HelloWorld.java

# 2. Run with JVM
java HelloWorld
\`\`\`
Output:
\`\`\`
Hello, World!
\`\`\`
`,

  'java syntax and conventions': `# Java Syntax and Naming Conventions

Writing idiomatic Java code requires following industry standard naming conventions and syntax rules:

### Standard Naming Conventions
- **Classes & Interfaces**: PascalCase (e.g. \`StudentManager\`, \`ArrayList\`, \`Runnable\`)
- **Methods & Variables**: camelCase (e.g. \`calculateTotalScore()\`, \`studentCount\`)
- **Constants**: UPPERCASE_WITH_UNDERSCORES (e.g. \`MAX_RETRY_COUNT\`, \`PI\`)
- **Packages**: all lowercase (e.g. \`com.education.hub.util\`)

### Core Syntax Rules
1. **Case-Sensitive**: \`num\` and \`Num\` are completely distinct identifiers.
2. **Semicolons**: Every statement in Java must end with a semicolon (\`;\`).
3. **Curly Brackets**: Code blocks (classes, methods, control structures) are demarcated by \`{ ... }\`.
4. **Comments**:
   - Single-line: \`// comment\`
   - Multi-line: \`/* comment */\`
   - Documentation: \`/** JavaDoc */\`
`,

  'variables and data types in java': `# Variables and Data Types in Java

In Java, every variable has a declared data type that specifies the size and layout of its memory and the range of values it can store.

### Primitive Data Types (8 Types)
1. **byte**: 8-bit integer (-128 to 127)
2. **short**: 16-bit integer (-32,768 to 32,767)
3. **int**: 32-bit integer (most common integer type)
4. **long**: 64-bit integer (e.g. \`10000000000L\`)
5. **float**: 32-bit floating point (e.g. \`3.14f\`)
6. **double**: 64-bit double precision float (default for decimals, e.g. \`99.99\`)
7. **boolean**: \`true\` or \`false\` (1 bit)
8. **char**: 16-bit Unicode character (e.g. \`'A'\`)

### Non-Primitive (Reference) Types
- **String**: Represents a sequence of characters (\`"Hello"\`).
- **Arrays**: Container holding values of the same type.
- **Classes & Objects**: User-defined data types.

\`\`\`java
public class VariablesDemo {
    public static void main(String[] args) {
        int age = 20;
        double salary = 75000.50;
        char grade = 'A';
        boolean isEnrolled = true;
        String studentName = "Alex";

        System.out.println("Student: " + studentName);
        System.out.println("Age: " + age + " | Grade: " + grade);
    }
}
\`\`\`
`,

  'operators in java': `# Operators in Java

Operators are special symbols used to perform operations on variables and values.

### 1. Arithmetic Operators
- \`+\` Addition
- \`-\` Subtraction
- \`*\` Multiplication
- \`/\` Division
- \`%\` Modulus (remainder)

### 2. Relational (Comparison) Operators
- \`==\` Equal to
- \`!=\` Not equal to
- \`>\` Greater than
- \`<\` Less than
- \`>=\` Greater than or equal to
- \`<=\` Less than or equal to

### 3. Logical Operators
- \`&&\` Logical AND (both conditions true)
- \`||\` Logical OR (at least one condition true)
- \`!\` Logical NOT (inverts boolean value)

### 4. Assignment & Unary Operators
- \`=\`, \`+=\`, \`-=\`, \`*=\`, \`/=\`
- \`++\` (increment), \`--\` (decrement)
`,

  'type casting in java': `# Type Casting in Java

Type casting is assigning a value of one primitive data type to another type.

### 1. Widening Casting (Implicit / Automatic)
Converting a smaller type to a larger type size. Done automatically by Java without loss of precision:
\`byte -> short -> char -> int -> long -> float -> double\`

\`\`\`java
int myInt = 9;
double myDouble = myInt; // Automatic casting: int to double (9.0)
\`\`\`

### 2. Narrowing Casting (Explicit / Manual)
Converting a larger type to a smaller type size. Must be explicitly written with parentheses:
\`double -> float -> long -> int -> char -> short -> byte\`

\`\`\`java
double myDouble = 9.78d;
int myInt = (int) myDouble; // Manual casting: returns 9 (truncates decimal)
\`\`\`
`,

  'console input/output (scanner)': `# Console Input and Output in Java (Scanner)

Java provides standard I/O streams: \`System.out\` for output and \`System.in\` with the \`Scanner\` class for reading user inputs.

\`\`\`java
import java.util.Scanner;

public class UserInputDemo {
    public static void main(String[] args) {
        // Create Scanner object
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter your name: ");
        String name = sc.nextLine(); // Reads full string

        System.out.print("Enter your age: ");
        int age = sc.nextInt(); // Reads integer

        System.out.println("Hello, " + name + "! You are " + age + " years old.");

        sc.close(); // Clean up resource
    }
}
\`\`\`

### Useful Scanner Methods:
- \`nextLine()\`: Reads text until end of line
- \`next()\`: Reads next single word/token
- \`nextInt()\`: Reads an integer
- \`nextDouble()\`: Reads a double
- \`nextBoolean()\`: Reads true/false
`,

  'if-else statements': `# Control Flow: If-Else Statements in Java

Decision making statements execute specific blocks of code depending on whether conditions evaluate to \`true\` or \`false\`.

\`\`\`java
public class DecisionDemo {
    public static void main(String[] args) {
        int score = 85;

        if (score >= 90) {
            System.out.println("Grade: A");
        } else if (score >= 80) {
            System.out.println("Grade: B");
        } else if (score >= 70) {
            System.out.println("Grade: C");
        } else {
            System.out.println("Grade: Needs Improvement");
        }
    }
}
\`\`\`

### Ternary Operator (Shorthand if-else)
\`\`\`java
int marks = 65;
String result = (marks >= 50) ? "Passed" : "Failed";
\`\`\`
`,

  'switch case statements': `# Switch Case Statements in Java

The \`switch\` statement selects one of many code blocks to be executed based on the evaluation of an expression.

\`\`\`java
public class SwitchDemo {
    public static void main(String[] args) {
        int day = 3;
        String dayName;

        switch (day) {
            case 1: dayName = "Monday"; break;
            case 2: dayName = "Tuesday"; break;
            case 3: dayName = "Wednesday"; break;
            case 4: dayName = "Thursday"; break;
            case 5: dayName = "Friday"; break;
            default: dayName = "Weekend"; break;
        }

        System.out.println("Today is: " + dayName);
    }
}
\`\`\`
`,

  'for loop': `# For Loops in Java

Loops are used to execute a block of code repeatedly as long as a specified condition is true.

### Standard For Loop
\`\`\`java
// Prints 1 to 5
for (int i = 1; i <= 5; i++) {
    System.out.println("Count: " + i);
}
\`\`\`

### Enhanced For-Each Loop (Arrays & Collections)
\`\`\`java
String[] languages = {"Java", "Python", "C++", "JavaScript"};
for (String lang : languages) {
    System.out.println("Coding in: " + lang);
}
\`\`\`
`,

  'while loop': `# While Loops in Java

A \`while\` loop tests the condition before executing the loop body. It repeats while the condition remains \`true\`.

\`\`\`java
public class WhileDemo {
    public static void main(String[] args) {
        int i = 1;
        while (i <= 5) {
            System.out.println("Step " + i);
            i++;
        }
    }
}
\`\`\`
`,

  'do-while loop': `# Do-While Loops in Java

Unlike \`while\`, a \`do-while\` loop evaluates its condition **after** executing the block. This guarantees the loop body runs **at least once**.

\`\`\`java
public class DoWhileDemo {
    public static void main(String[] args) {
        int num = 10;
        do {
            System.out.println("Executes at least once! Value: " + num);
            num++;
        } while (num < 5);
    }
}
\`\`\`
`,

  'break and continue': `# Break and Continue in Java

Control loop flow precisely using \`break\` and \`continue\`:

- **\`break\`**: Immediately terminates the entire loop.
- **\`continue\`**: Skips the current iteration and jumps directly to the next iteration.

\`\`\`java
for (int i = 1; i <= 10; i++) {
    if (i == 4) continue; // Skips 4
    if (i == 8) break;    // Stops when i reaches 8
    System.out.print(i + " ");
}
// Output: 1 2 3 5 6 7
\`\`\`
`,

  'arrays in java (1d and 2d)': `# Arrays in Java (1D and 2D)

An array is a container object that holds a fixed number of values of a single type.

### 1D Array
\`\`\`java
int[] numbers = new int[5]; // Array of size 5
numbers[0] = 10;
numbers[1] = 20;

// Shortcut declaration
int[] primes = {2, 3, 5, 7, 11};
System.out.println("Length: " + primes.length);
\`\`\`

### 2D Array (Matrix)
\`\`\`java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6}
};
System.out.println("Row 1, Col 2: " + matrix[0][1]); // 2
\`\`\`
`,

  'strings in java': `# Strings in Java

In Java, Strings are **objects** and are **immutable** (cannot be changed once created). Any modification creates a new String object.

\`\`\`java
public class StringsDemo {
    public static void main(String[] args) {
        String greeting = "Hello, Java!";

        System.out.println("Length: " + greeting.length());
        System.out.println("Uppercase: " + greeting.toUpperCase());
        System.out.println("Contains 'Java': " + greeting.contains("Java"));
        System.out.println("Substring: " + greeting.substring(7, 11)); // Java
    }
}
\`\`\`

### StringBuilder (For mutable, high-performance string manipulation)
\`\`\`java
StringBuilder sb = new StringBuilder();
sb.append("Learning ");
sb.append("Java ");
sb.append("Fast!");
System.out.println(sb.toString());
\`\`\`
`,

  'introduction to object-oriented programming': `# Introduction to Object-Oriented Programming (OOP)

OOP is a programming paradigm based on the concept of **objects**, which contain data (fields/attributes) and code (methods/functions).

### The 4 Pillars of OOP:
1. **Encapsulation**: Bundling data and methods into a single unit, restricting direct access via private fields and public getters/setters.
2. **Inheritance**: Mechanism where a child class inherits properties and behaviors from a parent class (\`extends\`).
3. **Polymorphism**: The ability of an action to take multiple forms (Method Overloading & Method Overriding).
4. **Abstraction**: Hiding internal implementation details and showing only necessary functionality to the user (Abstract Classes & Interfaces).
`,

  'classes, objects, and methods': `# Classes, Objects, and Methods in Java

A **Class** is a blueprint/template from which individual **Objects** are created.

\`\`\`java
// Class Definition
class Car {
    // Fields (State)
    String brand;
    int speed;

    // Method (Behavior)
    void accelerate(int increase) {
        speed += increase;
        System.out.println(brand + " speed is now " + speed + " km/h");
    }
}

public class Main {
    public static void main(String[] args) {
        // Creating an Object (Instance)
        Car myCar = new Car();
        myCar.brand = "Tesla";
        myCar.speed = 50;

        myCar.accelerate(30);
    }
}
\`\`\`
`,

  'constructors and \'this\' keyword': `# Constructors and the 'this' Keyword in Java

A **Constructor** is a special method used to initialize objects when they are created using \`new\`.

- Has the **same name as the class**.
- Has **no return type** (not even \`void\`).
- **\`this\`** refers to the current object instance.

\`\`\`java
class Student {
    String name;
    int rollNo;

    // Parameterized Constructor
    Student(String name, int rollNo) {
        this.name = name;
        this.rollNo = rollNo;
    }

    void display() {
        System.out.println("Roll: " + this.rollNo + " | Name: " + this.name);
    }
}

public class Main {
    public static void main(String[] args) {
        Student s1 = new Student("Rohit", 101);
        s1.display();
    }
}
\`\`\`
`,

  'inheritance and types': `# Inheritance in Java

Inheritance is an OOP mechanism where one class acquires the properties and methods of another class using the \`extends\` keyword.

- **Superclass (Parent)**: The class being inherited from.
- **Subclass (Child)**: The class that inherits.

\`\`\`java
// Parent Class
class Animal {
    void eat() {
        System.out.println("This animal eats food.");
    }
}

// Child Class
class Dog extends Animal {
    void bark() {
        System.out.println("The dog barks: Woof woof!");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog d = new Dog();
        d.eat();  // Inherited method
        d.bark(); // Subclass method
    }
}
\`\`\`
`,

  'polymorphism (overloading & overriding)': `# Polymorphism in Java

Polymorphism means "many forms". In Java, it comes in two types:

### 1. Compile-Time Polymorphism (Method Overloading)
Multiple methods in the same class with the same name but different parameters.

\`\`\`java
class MathUtil {
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; }
    int add(int a, int b, int c) { return a + b + c; }
}
\`\`\`

### 2. Runtime Polymorphism (Method Overriding)
A child class provides a specific implementation of a method already defined in its parent class using \`@Override\`.

\`\`\`java
class Shape {
    void draw() { System.out.println("Drawing a shape"); }
}

class Circle extends Shape {
    @Override
    void draw() { System.out.println("Drawing a circle"); }
}
\`\`\`
`,

  'encapsulation and access modifiers': `# Encapsulation and Access Modifiers

Encapsulation hides sensitive data inside a class, exposing it only through public getter and setter methods.

### Access Modifiers:
- **\`private\`**: Accessible only within the same class.
- **\`default\` (no keyword)**: Accessible within the same package.
- **\`protected\`**: Accessible in the same package and subclasses.
- **\`public\`**: Accessible everywhere.

\`\`\`java
class BankAccount {
    private double balance; // Private variable

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }
}
\`\`\`
`,

  'abstraction and interfaces': `# Abstraction and Interfaces in Java

Abstraction hides complex background implementation and exposes only the essential interface to the user.

### 1. Abstract Class
Cannot be instantiated directly. Can have both abstract methods (without body) and concrete methods.

### 2. Interface
A 100% abstract contract specifying what a class must do. Classes implement interfaces with \`implements\`.

\`\`\`java
interface PaymentGateway {
    void processPayment(double amount);
}

class PayPalGateway implements PaymentGateway {
    public void processPayment(double amount) {
        System.out.println("Processed $" + amount + " via PayPal.");
    }
}
\`\`\`
`,

  'exception handling basics (try-catch)': `# Exception Handling in Java (Try-Catch)

An **Exception** is an abnormal event that disrupts the normal flow of program execution. Java provides robust exception handling using \`try\`, \`catch\`, and \`finally\`.

\`\`\`java
public class ExceptionDemo {
    public static void main(String[] args) {
        try {
            int result = 10 / 0; // ArithmeticException
            System.out.println("Result: " + result);
        } catch (ArithmeticException e) {
            System.err.println("Error: Cannot divide by zero! " + e.getMessage());
        } finally {
            System.out.println("Finally block always executes (e.g. for closing files/connections).");
        }
    }
}
\`\`\`
`,

  'java collections framework (list, set, map)': `# Java Collections Framework (List, Set, Map)

The Collections Framework provides high-performance data structures and algorithms in \`java.util\`.

### 1. List (Ordered, allows duplicates)
\`\`\`java
List<String> list = new ArrayList<>();
list.add("Java");
list.add("Python");
list.add("Java"); // Duplicates allowed
\`\`\`

### 2. Set (Unordered, UNIQUE elements only)
\`\`\`java
Set<Integer> set = new HashSet<>();
set.add(10);
set.add(20);
set.add(10); // Ignored
\`\`\`

### 3. Map (Key-Value pairs, keys are unique)
\`\`\`java
Map<String, Integer> map = new HashMap<>();
map.put("Alice", 95);
map.put("Bob", 88);
System.out.println("Alice's score: " + map.get("Alice"));
\`\`\`
`,

  'introduction to python': `# Introduction to Python

Python is a versatile, high-level, interpreted programming language celebrated for its clear, human-readable syntax.

### Why Learn Python?
- **Readability**: Code resembles plain English, drastically lowering the learning curve.
- **Versatility**: Widely used in Artificial Intelligence, Machine Learning, Data Science, Web Development (Django/Flask), and Automation.
- **Vast Standard Library**: "Batteries included" philosophy with rich modules for everything from math to HTTP requests.

\`\`\`python
# Simple Python Program
name = "World"
print(f"Hello, {name}!")

# List comprehension example
numbers = [1, 2, 3, 4, 5]
squares = [n ** 2 for n in numbers]
print("Squares:", squares)
\`\`\`
`
};

fs.writeFileSync(path.join(__dirname, 'content_cache.json'), JSON.stringify(cache, null, 2), 'utf8');
console.log('Successfully created content_cache.json with', Object.keys(cache).length, 'pre-cached topics!');
