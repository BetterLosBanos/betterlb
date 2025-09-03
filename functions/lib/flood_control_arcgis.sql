-- SQL schema for flood control data from ArcGIS REST format
-- This schema is designed to store the flood control project data

-- Drop table if it exists
DROP TABLE IF EXISTS flood_control_projects;

-- Create the table with the new structure based on ArcGIS REST format
CREATE TABLE flood_control_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  global_id TEXT UNIQUE NOT NULL,  -- GlobalID from ArcGIS (primary identifier)
  object_id INTEGER,               -- ObjectId from ArcGIS
  
  -- Project identification
  project_id TEXT,                 -- ProjectID
  project_description TEXT,        -- ProjectDescription
  project_component_id TEXT,       -- ProjectComponentID
  project_component_description TEXT, -- ProjectComponentDescription
  contract_id TEXT,                -- ContractID
  
  -- Location information
  region TEXT,                     -- Region
  province TEXT,                   -- Province
  municipality TEXT,               -- Municipality
  legislative_district TEXT,       -- LegislativeDistrict
  district_engineering_office TEXT, -- DistrictEngineeringOffice
  latitude REAL,                   -- Latitude
  longitude REAL,                  -- Longitude
  
  -- Project details
  implementing_office TEXT,        -- ImplementingOffice
  type_of_work TEXT,               -- TypeofWork
  infra_type TEXT,                 -- infra_type
  program TEXT,                    -- Program
  
  -- Financial information
  abc REAL,                        -- ABC (Approved Budget for the Contract)
  abc_string TEXT,                 -- ABC_String
  contract_cost REAL,              -- ContractCost
  contract_cost_string TEXT,       -- ContractCost_String
  
  -- Temporal information
  infra_year INTEGER,              -- InfraYear
  funding_year TEXT,               -- FundingYear
  start_date TEXT,                 -- StartDate
  completion_date_actual TEXT,     -- CompletionDateActual
  completion_date_original INTEGER, -- CompletionDateOriginal (timestamp)
  completion_year INTEGER,         -- CompletionYear
  
  -- Contractor information
  contractor TEXT,                 -- Contractor
  
  -- Metadata
  creation_date INTEGER,           -- CreationDate (timestamp)
  creator TEXT,                    -- Creator
  edit_date INTEGER,               -- EditDate (timestamp)
  editor TEXT,                     -- Editor
  
  -- Additional fields
  slug TEXT,                       -- Generated slug for SEO-friendly URLs
  
  -- Timestamps
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Create indexes for common search fields
CREATE INDEX idx_flood_control_project_id ON flood_control_projects(project_id);
CREATE INDEX idx_flood_control_contract_id ON flood_control_projects(contract_id);
CREATE INDEX idx_flood_control_region ON flood_control_projects(region);
CREATE INDEX idx_flood_control_province ON flood_control_projects(province);
CREATE INDEX idx_flood_control_municipality ON flood_control_projects(municipality);
CREATE INDEX idx_flood_control_contractor ON flood_control_projects(contractor);
CREATE INDEX idx_flood_control_funding_year ON flood_control_projects(funding_year);
CREATE INDEX idx_flood_control_slug ON flood_control_projects(slug);

-- Create a view for simplified access to the most important fields
CREATE VIEW flood_control_projects_view AS
SELECT
  id,
  global_id,
  project_id,
  project_description,
  contract_id,
  region,
  province,
  municipality,
  legislative_district,
  district_engineering_office,
  latitude,
  longitude,
  type_of_work,
  infra_type,
  abc,
  contract_cost,
  funding_year,
  start_date,
  completion_date_actual,
  contractor,
  slug
FROM flood_control_projects;
