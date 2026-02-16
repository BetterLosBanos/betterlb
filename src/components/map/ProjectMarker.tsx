import { FC } from 'react';

import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';

interface FloodControlProject {
  GlobalID?: string;
  objectID?: string;
  ProjectDescription?: string;
  InfraYear?: string;
  Region?: string;
  Province?: string;
  Municipality?: string;
  TypeofWork?: string;
  Contractor?: string;
  ContractCost?: string;
  Latitude?: string;
  Longitude?: string;
}

interface ProjectMarkerProps {
  project: FloodControlProject;
  icon: L.Icon;
}

const ProjectMarker: FC<ProjectMarkerProps> = ({ project, icon }) => {
  const lat = parseFloat(project.Latitude!);
  const lng = parseFloat(project.Longitude!);

  return (
    <Marker position={[lat, lng]} icon={icon}>
      <Popup>
        <div className='min-w-[200px]'>
          <h3 className='text-kapwa-text-strong font-bold'>
            {project.ProjectDescription || 'Unnamed Project'}
          </h3>
          <p className='text-kapwa-text-support mt-1 text-sm'>
            <strong>Region:</strong> {project.Region || 'N/A'}
          </p>
          <p className='text-kapwa-text-support text-sm'>
            <strong>Province:</strong> {project.Province || 'N/A'}
          </p>
          <p className='text-kapwa-text-support text-sm'>
            <strong>Municipality:</strong> {project.Municipality || 'N/A'}
          </p>
          <p className='text-kapwa-text-support text-sm'>
            <strong>Contractor:</strong> {project.Contractor || 'N/A'}
          </p>
          <p className='text-kapwa-text-support text-sm'>
            <strong>Cost:</strong> ₱
            {project.ContractCost
              ? Number(project.ContractCost).toLocaleString()
              : 'N/A'}
          </p>
          <p className='text-kapwa-text-support text-sm'>
            <strong>Year:</strong> {project.InfraYear || 'N/A'}
          </p>
        </div>
      </Popup>
    </Marker>
  );
};

export default ProjectMarker;
export type { FloodControlProject };
