import React from 'react';

const Maps = () => {
  return (
    <div className="container mx-auto p-4">
      {/* Main Page Header */}
      <h1 className="text-4xl font-bold mb-10 text-center">City Maps</h1>

      {/* MAP SECTION */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 border-l-4 border-blue-600 pl-3">
          Sakay sa LB: Routes and Stops
        </h2>
        
        <p className="mb-4 text-gray-600">
          A guide to public transit stops, routes and terminals around Los Baños.
        </p>

        <div className="w-full h-[600px] border rounded-lg overflow-hidden shadow-lg bg-gray-100">
          <iframe 
            src="https://www.google.com/maps/d/embed?mid=1BJQMldVaiZEcG5MdTqc0hI3Yzsr_T5I&ehbc=2E312F" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy"
            title="Sakay sa LB: Routes and Stops"
          ></iframe>
        </div>
      </div>

    </div>
  );
};

export default Maps;