import React, { useState } from 'react';
import Sidebar, { type PageId } from '../components/Sidebar';
import DashboardPage from '../pages/DashboardPage';
import InstitutionsPage from '../pages/InstitutionsPage';
import TestimonialsPage from '../pages/TestimonialsPage';
import CoursePage from '../pages/CoursePage';
import TestPage from '../pages/TestPage';
import MaterialPage from '../pages/MaterialPage';
import UsersPage from '../pages/UsersPage';
import ProfilePage from '../pages/ProfilePage';
import NotificationsPage from '../pages/NotificationsPage';
import CurrentAffairsPage from '../pages/CurrentAffairsPage';
import EnrollmentsPage from '../pages/EnrollmentsPage';
import TermsPage from '../pages/TermsPage';
import ContactPage from '../pages/ContactPage';
import MessagesPage from '../pages/MessagesPage';
import CarouselPage from '../pages/Carousel';
import YouTubeVideosPage from '../pages/YoutubeVideosPage';
import TextSliderPage from '../pages/TextSliderPage';
import { Menu } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('users');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const renderCurrentPage = (): React.ReactNode => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'institutions':
        return <InstitutionsPage />;
      case 'testimonials':
        return <TestimonialsPage />;
      case 'carousel':
        return <CarouselPage />;
      case 'course':
        return <CoursePage />;
      case 'test':
        return <TestPage />;
      case 'material':
        return <MaterialPage />;
      case 'youtube':
        return <YouTubeVideosPage />;
      case 'text_slider':
        return <TextSliderPage />;
      case 'users':
        return <UsersPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'current_affairs':
        return <CurrentAffairsPage />;
      case 'enrollments':
        return <EnrollmentsPage />;
      case 'terms':
        return <TermsPage />;
      case 'contact':
        return <ContactPage />;
      case 'messages':
        return <MessagesPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  const getPageTitle = (): string => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'institutions':
        return 'Institutions';
      case 'testimonials':
        return 'Testimonials';
      case 'carousel':
        return 'Carousel';
      case 'youtube':
        return 'YouTube Videos';
      case 'text_slider':
        return 'Text Slider';
      case 'course':
        return 'Course Management';
      case 'test':
        return 'Test Management';
      case 'material':
        return 'Material Management';
      case 'users':
        return 'Users';
      case 'notifications':
        return 'Notifications';
      case 'current_affairs':
        return 'Current Affairs';
      case 'enrollments':
        return 'Enrollments';
      case 'terms':
        return 'Terms & Conditions';
      case 'contact':
        return 'Contact Info';
      case 'messages':
        return 'Contact Messages';
      case 'profile':
        return 'Profile Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
            <div className="w-10"></div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;


