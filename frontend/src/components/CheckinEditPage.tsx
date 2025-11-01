import React from 'react';
import { useParams } from 'react-router-dom';
import CheckinForm from './CheckinForm';

const CheckinEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const checkinId = id ? parseInt(id, 10) : undefined;

  if (!checkinId || isNaN(checkinId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Invalid Check-in ID
              </h2>
              <p className="text-gray-600">
                The check-in you're looking for could not be found.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <CheckinForm checkinId={checkinId} />;
};

export default CheckinEditPage;