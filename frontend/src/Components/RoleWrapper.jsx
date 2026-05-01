import React from 'react';
import { useSelector } from 'react-redux';

/**
 * RoleWrapper component to handle Role-Based Access Control (RBAC) in the UI.
 * 
 * @param {Object} props
 * @param {Array<string>} props.allowedRoles - List of roles that are allowed to see the children.
 * @param {React.ReactNode} props.children - The components to render if the user has the required role.
 * @param {React.ReactNode} [props.fallback=null] - Optional fallback component to render if the user is not allowed.
 */
const RoleWrapper = ({ allowedRoles, children, fallback = null }) => {
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role?.toLowerCase();

  if (allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default RoleWrapper;
