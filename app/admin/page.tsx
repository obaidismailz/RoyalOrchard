"use client";
import React from 'react';
import dynamic from 'next/dynamic';

const AdminPage = dynamic(() => import('../../components/Admin'), { ssr: false });

export default function AdminRoute() {
  return <AdminPage />;
}
