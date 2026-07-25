-- Karnataka State Police Department FIR System Database Schema
-- Matching KSP Datathon 2026 Official ER Diagram Specification
-- Version 2.0 — Production-Grade Complete Schema (all FIR ER tables)
-- SAFE TO RUN: All additions use CREATE TABLE IF NOT EXISTS

-- 0. State & District Master Tables
CREATE TABLE IF NOT EXISTS State (
    StateID   INT PRIMARY KEY,
    StateName VARCHAR(100) NOT NULL
);
INSERT INTO State (StateID, StateName) VALUES (29, 'Karnataka') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS District (
    DistrictID   INT PRIMARY KEY,
    StateID      INT REFERENCES State(StateID),
    DistrictName VARCHAR(100) NOT NULL,
    Active       BIT DEFAULT 1
);

-- 0b. Rank & Designation Lookup Tables
CREATE TABLE IF NOT EXISTS Rank (
    RankID      INT PRIMARY KEY,
    RankName    VARCHAR(100) NOT NULL,    -- e.g. Constable, ASI, SI, PI, DySP, SP, DCP, IGP, ADGP, DGP
    ClearanceLevel INT NOT NULL DEFAULT 1 -- 1=Constable/Beat, 2=IO, 3=SHO, 4=DCP, 5=IGP, 6=DGP/HQ
);

CREATE TABLE IF NOT EXISTS Designation (
    DesignationID   INT PRIMARY KEY,
    DesignationName VARCHAR(100) NOT NULL
);

-- 0c. Case Status & Gravity Offence Master Tables
CREATE TABLE IF NOT EXISTS CaseStatusMaster (
    CaseStatusID   INT PRIMARY KEY,
    CaseStatusName VARCHAR(100) NOT NULL  -- Open, Under Investigation, Chargesheeted, Closed, Referred, etc.
);

CREATE TABLE IF NOT EXISTS GravityOffence (
    GravityOffenceID   INT PRIMARY KEY,
    GravityOffenceName VARCHAR(100) NOT NULL  -- Minor, Serious, Heinous, Atrocity, Special Law, etc.
);

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

-- 10. ActSectionAssociation Table (Case <-> Act <-> Section many-to-many)
CREATE TABLE IF NOT EXISTS ActSectionAssociation (
    AssociationID  SERIAL PRIMARY KEY,
    CaseMasterID   INT REFERENCES CaseMaster(CaseMasterID) ON DELETE CASCADE,
    ActCode        VARCHAR(50) REFERENCES Act(ActCode),
    SectionID      INT REFERENCES Section(SectionID),
    AddedByID      INT REFERENCES Employee(EmployeeID),
    AddedDate      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsLegacy       BIT DEFAULT 0,  -- 1 = IPC section; 0 = BNS/new section
    UNIQUE (CaseMasterID, ActCode, SectionID)
);

CREATE INDEX IF NOT EXISTS idx_actsection_case ON ActSectionAssociation (CaseMasterID);
CREATE INDEX IF NOT EXISTS idx_actsection_act  ON ActSectionAssociation (ActCode);

-- 11. CrimeHeadActSection — canonical mapping of crime heads to applicable acts/sections
CREATE TABLE IF NOT EXISTS CrimeHeadActSection (
    CrimeHeadActSectionID SERIAL PRIMARY KEY,
    CrimeHeadID           INT REFERENCES CrimeHead(CrimeHeadID),
    CrimeSubHeadID        INT REFERENCES CrimeSubHead(CrimeSubHeadID),
    ActCode               VARCHAR(50) REFERENCES Act(ActCode),
    SectionID             INT REFERENCES Section(SectionID),
    IsPrimary             BIT DEFAULT 1,
    UNIQUE (CrimeHeadID, ActCode, SectionID)
);

-- 12. ChargesheetDetails Table (chargesheet milestone per case)
CREATE TABLE IF NOT EXISTS ChargesheetDetails (
    ChargesheetID       SERIAL PRIMARY KEY,
    CaseMasterID        INT REFERENCES CaseMaster(CaseMasterID) ON DELETE CASCADE,
    ChargesheetDate     DATE NOT NULL,
    ChargesheetTypeID   INT DEFAULT 1,  -- 1=Final, 2=Supplementary, 3=Abatement
    IOID                INT REFERENCES Employee(EmployeeID),
    CourtID             INT,
    FiledInCourtDate    DATE,
    NextHearingDate     DATE,
    RemarksText         TEXT,
    CreatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chargesheet_case    ON ChargesheetDetails (CaseMasterID);
CREATE INDEX IF NOT EXISTS idx_chargesheet_io      ON ChargesheetDetails (IOID);
CREATE INDEX IF NOT EXISTS idx_chargesheet_date    ON ChargesheetDetails (ChargesheetDate);

-- Back-fill FK constraints on CaseMaster referencing new lookup tables
-- (Only add if the columns already exist but FKs are not yet created)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_casemaster_status'
    ) THEN
        ALTER TABLE CaseMaster
            ADD CONSTRAINT fk_casemaster_status
            FOREIGN KEY (CaseStatusID) REFERENCES CaseStatusMaster(CaseStatusID);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_casemaster_gravity'
    ) THEN
        ALTER TABLE CaseMaster
            ADD CONSTRAINT fk_casemaster_gravity
            FOREIGN KEY (GravityOffenceID) REFERENCES GravityOffence(GravityOffenceID);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_employee_rank'
    ) THEN
        ALTER TABLE Employee
            ADD CONSTRAINT fk_employee_rank
            FOREIGN KEY (RankID) REFERENCES Rank(RankID);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_employee_designation'
    ) THEN
        ALTER TABLE Employee
            ADD CONSTRAINT fk_employee_designation
            FOREIGN KEY (DesignationID) REFERENCES Designation(DesignationID);
    END IF;
END $$;

-- Seed reference data
INSERT INTO Rank (RankID, RankName, ClearanceLevel) VALUES
    (1,  'Constable',                  1),
    (2,  'Head Constable',             1),
    (3,  'Assistant Sub-Inspector',    2),
    (4,  'Sub-Inspector',              2),
    (5,  'Police Inspector',           3),
    (6,  'Deputy Superintendent',      3),
    (7,  'Superintendent of Police',   4),
    (8,  'Deputy Commissioner',        4),
    (9,  'Inspector General',          5),
    (10, 'Addl. Director General',     5),
    (11, 'Director General of Police', 6)
ON CONFLICT DO NOTHING;

INSERT INTO CaseStatusMaster (CaseStatusID, CaseStatusName) VALUES
    (1, 'Registered'),
    (2, 'Under Investigation'),
    (3, 'Chargesheeted'),
    (4, 'Closed — True'),
    (5, 'Closed — False'),
    (6, 'Referred to Civil Court'),
    (7, 'Abated — Death of Accused')
ON CONFLICT DO NOTHING;

INSERT INTO GravityOffence (GravityOffenceID, GravityOffenceName) VALUES
    (1, 'Minor / Petty'),
    (2, 'Serious'),
    (3, 'Heinous'),
    (4, 'SC/ST Atrocity'),
    (5, 'Special Law (NDPS/POCSO)'),
    (6, 'Cyber Crime'),
    (7, 'Economic Offence')
ON CONFLICT DO NOTHING;
