import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Link, useLocation } from 'react-router-dom';

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const DashboardBreadcrumbs = () => {
  const location = useLocation();
  
  const pathSegments = location.pathname.split('/').filter(Boolean);

  let currentPath = '';

  return (
    <Breadcrumbs>
      <BreadcrumbItem>
        <Link to="/dashboard">Home</Link>
      </BreadcrumbItem>

      {pathSegments.map((segment, index) => {
        currentPath += `/${segment}`;

        
        const isLast = index === pathSegments.length - 1;
        const capitalizedSegment = capitalizeFirstLetter(segment);

        return (
          <BreadcrumbItem key={currentPath}>
            {isLast ? (
              <span>{capitalizedSegment}</span>
            ) : (
              <Link to={currentPath}>{capitalizedSegment}</Link>
            )}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumbs>
  );
}

export default DashboardBreadcrumbs;