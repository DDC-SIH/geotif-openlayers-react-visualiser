import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-screen-xl mx-auto">
        {/* Admin Dashboard Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Manage authorization requests and more</p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Authorization Requests Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 transition-transform transform hover:scale-[1.01] hover:shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Authorization Requests</h2>
            <p className="text-gray-600 mb-4">Review and manage all authorization requests submitted by users.</p>
            <Link
              to="/admin/authorization-requests"
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-gray-400 transition-all"
            >
              View Requests
            </Link>
          </div>

          
          <div className="bg-white rounded-lg shadow-lg p-6 transition-transform transform hover:scale-[1.01] hover:shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Other Admin Tasks</h2>
            <p className="text-gray-600 mb-4">Manage users, settings, and perform other admin tasks.</p>
            <Link
              to="/admin/other-task"
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-gray-400 transition-all"
            >
              Explore Tasks
            </Link>
          </div>

         
          <div className="bg-white rounded-lg shadow-lg p-6 transition-transform transform hover:scale-[1.01] hover:shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reports</h2>
            <p className="text-gray-600 mb-4">Generate and view reports for system analysis.</p>
            <Link
              to="/admin/reports"
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-gray-400 transition-all"
            >
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
