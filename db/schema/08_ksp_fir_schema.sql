-- Karnataka State Police Department FIR System Database Schema
-- Matching KSP Datathon 2026 Official ER Diagram Specification

-- 1. UnitType & Unit Tables (Police Stations, Circle Offices, District HQs)
CREATE TABLE IF NOT EXISTS UnitType (
    UnitTypeID INT PRIMARY KEY,
    UnitTypeName VARCHAR(100) NOT NULL,
    CityDistState VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Unit (
    UnitID INT PRIMARY KEY,
    UnitName VARCHAR(150) NOT NULL,
    TypeID INT REFERENCES UnitType(UnitTypeID),
    ParentUnit INT,
    StateID INT DEFAULT 29, -- Karnataka State ID
    DistrictID INT NOT NULL,
    Active BIT DEFAULT 1
);

-- 2. Employee Table (Police Officers, IOs, Constables)
CREATE TABLE IF NOT EXISTS Employee (
    EmployeeID INT PRIMARY KEY,
    DistrictID INT NOT NULL,
    UnitID INT REFERENCES Unit(UnitID),
    RankID INT NOT NULL,
    DesignationID INT NOT NULL,
    KGID VARCHAR(50) UNIQUE NOT NULL, -- Karnataka Government ID
    FirstName VARCHAR(100) NOT NULL,
    EmployeeDOB DATE,
    GenderID INT,
    AppointmentDate DATE
);

-- 3. CrimeHead & CrimeSubHead Tables
CREATE TABLE IF NOT EXISTS CrimeHead (
    CrimeHeadID INT PRIMARY KEY,
    CrimeGroupName VARCHAR(150) NOT NULL,
    Active BIT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS CrimeSubHead (
    CrimeSubHeadID INT PRIMARY KEY,
    CrimeHeadID INT REFERENCES CrimeHead(CrimeHeadID),
    CrimeHeadName VARCHAR(150) NOT NULL,
    SeqID INT
);

-- 4. Act & Section Tables (IPC, BNS 2023, NDPS, POCSO)
CREATE TABLE IF NOT EXISTS Act (
    ActCode VARCHAR(50) PRIMARY KEY,
    ActDescription VARCHAR(255) NOT NULL,
    ShortName VARCHAR(50),
    Active BIT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS Section (
    SectionID SERIAL PRIMARY KEY,
    ActCode VARCHAR(50) REFERENCES Act(ActCode),
    SectionCode VARCHAR(50) NOT NULL,
    SectionDescription VARCHAR(255),
    Active BIT DEFAULT 1
);

-- 5. CaseMaster Table (Main FIR Record)
CREATE TABLE IF NOT EXISTS CaseMaster (
    CaseMasterID INT PRIMARY KEY,
    CrimeNo VARCHAR(50) UNIQUE NOT NULL,
    CaseNo VARCHAR(50) NOT NULL,
    CrimeRegisteredDate TIMESTAMP NOT NULL,
    PolicePersonID INT REFERENCES Employee(EmployeeID),
    PoliceStationID INT REFERENCES Unit(UnitID),
    CaseCategoryID INT DEFAULT 1,
    GravityOffenceID INT DEFAULT 1,
    CrimeMajorHeadID INT REFERENCES CrimeHead(CrimeHeadID),
    CrimeMinorHeadID INT REFERENCES CrimeSubHead(CrimeSubHeadID),
    CaseStatusID INT DEFAULT 1,
    CourtID INT,
    IncidentFromDate TIMESTAMP,
    IncidentToDate TIMESTAMP,
    InfoReceivedPSDate TIMESTAMP,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    BriefFacts TEXT
);

-- 6. ComplainantDetails Table
CREATE TABLE IF NOT EXISTS ComplainantDetails (
    ComplainantID INT PRIMARY KEY,
    CaseMasterID INT REFERENCES CaseMaster(CaseMasterID),
    ComplainantName VARCHAR(150) NOT NULL,
    AgeYear INT,
    OccupationID INT,
    ReligionID INT,
    CasteID INT,
    GenderID INT
);

-- 7. Victim Table
CREATE TABLE IF NOT EXISTS Victim (
    VictimMasterID INT PRIMARY KEY,
    CaseMasterID INT REFERENCES CaseMaster(CaseMasterID),
    VictimName VARCHAR(150) NOT NULL,
    AgeYear INT,
    GenderID INT,
    VictimPolice VARCHAR(10) DEFAULT '0'
);

-- 8. Accused Table
CREATE TABLE IF NOT EXISTS Accused (
    AccusedMasterID INT PRIMARY KEY,
    CaseMasterID INT REFERENCES CaseMaster(CaseMasterID),
    AccusedName VARCHAR(150) NOT NULL,
    AgeYear INT,
    GenderID INT,
    PersonID VARCHAR(50)
);

-- 9. ArrestSurrender Table
CREATE TABLE IF NOT EXISTS ArrestSurrender (
    ArrestSurrenderID INT PRIMARY KEY,
    CaseMasterID INT REFERENCES CaseMaster(CaseMasterID),
    ArrestSurrenderTypeID INT,
    ArrestSurrenderDate DATE,
    StateID INT DEFAULT 29,
    DistrictID INT NOT NULL,
    PoliceStationID INT REFERENCES Unit(UnitID),
    IOID INT REFERENCES Employee(EmployeeID),
    CourtID INT,
    AccusedMasterID INT REFERENCES Accused(AccusedMasterID),
    IsAccused BIT DEFAULT 1,
    IsComplainantAccused BIT DEFAULT 0
);
