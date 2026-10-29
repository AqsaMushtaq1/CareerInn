# CareerInn — Online Job Portal

CareerInn is a web-based job portal developed using ASP.NET Core MVC and SQL Server. It aims to connect job seekers with employers through a simple and user-friendly platform where users can explore job opportunities, apply for jobs, and manage recruitment activities.

## Features

- **User Authentication:** Login and registration for users.
- **Job Listings:** Browse available job opportunities.
- **Job Details:** View job descriptions, requirements, and other relevant information.
- **Job Applications:** Apply for available jobs.
- **Company Dashboard:** Manage company-related activities and job postings.
- **Application Management:** View and manage submitted job applications.
- **Responsive Interface:** User-friendly web interface built with HTML, CSS, JavaScript, and Bootstrap.
- **Database Integration:** Store and manage application data using SQL Server.

## Technologies Used

| Technology | Purpose |
|---|---|
| C# | Backend programming |
| ASP.NET Core MVC | Web application framework |
| Entity Framework Core | Database access and ORM |
| SQL Server | Relational database |
| HTML5 | Web page structure |
| CSS3 | Styling and layout |
| JavaScript | Client-side interactivity |
| Bootstrap | Responsive UI components |
| Git & GitHub | Version control and source code management |

## Project Structure

```text
CareerInn/
├── Controllers/       # Application controllers
├── Data/              # Database context and factory
├── Migrations/        # Entity Framework migrations
├── Models/            # Application data models
├── Views/             # MVC views
├── wwwroot/
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   ├── lib/           # Frontend libraries
│   └── logos/         # Image and logo assets
├── Properties/        # Project launch settings
├── Program.cs         # Application entry point
├── appsettings.json   # Application configuration
└── CareerInn.csproj   # Project configuration
```

## Getting Started

### Prerequisites

Before running CareerInn, make sure you have:

- .NET SDK compatible with the project
- SQL Server
- Visual Studio with the ASP.NET and web development workload
- SQL Server Management Studio (SSMS), optional but recommended

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/AqsaMushtaq1/CareerInn.git
```

**2. Open the project**

Open `CareerInn.csproj` in Visual Studio.

**3. Configure the database**

Update the connection string in your local configuration to match your SQL Server instance. Do not commit database passwords or other secrets to GitHub.

**4. Apply database migrations**

Open the Package Manager Console in Visual Studio and run:

```powershell
Update-Database
```

Alternatively, use the .NET CLI if the required Entity Framework tools are configured:

```bash
dotnet ef database update
```

**5. Run the application**

Run the project from Visual Studio or use:

```bash
dotnet run
```

Open the local URL shown in the terminal or browser launch window.

## Learning Objectives

This project demonstrates practical implementation of:

- Model-View-Controller (MVC) architecture
- CRUD operations and database integration
- Entity Framework Core migrations
- User authentication and registration workflows
- Frontend and backend integration
- Version control using Git and GitHub

## Future Improvements

- Advanced job search and filtering
- Resume upload and management
- Email notifications for applications
- Role-based authorization
- Pagination and improved search functionality
- Deployment to a cloud hosting platform

## Author

**Aqsa Mushtaq**

GitHub: [@AqsaMushtaq1](https://github.com/AqsaMushtaq1)

## License

This project is currently intended for educational and portfolio purposes. No formal open-source license has been specified.
