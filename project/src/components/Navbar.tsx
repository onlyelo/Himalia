import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Settings, User, LogOut, Calendar } from 'lucide-react';
import { authService, type UserProfile } from '../services/authService';
import { memberService, type Member } from '../services/memberService';
import { getVisuals } from '../config/visuals';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [linkedMember, setLinkedMember] = useState<Member | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [logoUrl, setLogoUrl] = useState(getVisuals().mainLogo);
  const [logoError, setLogoError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      if (user) {
        const profile = await authService.getCurrentUser();
        setCurrentUser(profile);

        if (profile?.linkedMemberId) {
          try {
            const members = await memberService.getMembers();
            const member = members.find(m => m.id === profile.linkedMemberId);
            if (member) {
              setLinkedMember(member);
            }
          } catch (error) {
            console.error('Error fetching linked member:', error);
          }
        } else {
          setLinkedMember(null);
        }
      } else {
        setCurrentUser(null);
        setLinkedMember(null);
      }
    });

    const handleVisualsUpdate = () => {
      setLogoUrl(getVisuals().mainLogo);
      setLogoError(false);
    };

    window.addEventListener('visualsUpdated', handleVisualsUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('visualsUpdated', handleVisualsUpdate);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            {logoError ? (
              <div className="h-8 w-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white font-bold">H</span>
              </div>
            ) : (
              <img 
                src={logoUrl}
                alt="Himalia Logo"
                className="h-8 w-8"
                onError={handleLogoError}
              />
            )}
            <span className="text-xl font-bold text-accent">
              HIMALIA
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-accent transition-colors">
              Accueil
            </Link>
            <Link to="/organization" className="text-gray-300 hover:text-accent transition-colors">
              Organisation
            </Link>
            <Link to="/fleet-manager" className="text-gray-300 hover:text-accent transition-colors">
              Fleet Manager
            </Link>
            <Link to="/tools" className="text-gray-300 hover:text-accent transition-colors">
              Outils
            </Link>
            <Link to="/blog" className="text-gray-300 hover:text-accent transition-colors">
              Verse News
            </Link>
            <Link to="/planning" className="text-gray-300 hover:text-accent transition-colors">
              <Calendar className="h-5 w-5" />
            </Link>
            {currentUser?.role === 'admin' && (
              <Link
                to="/dashboard"
                className="text-gray-300 hover:text-accent transition-colors"
                title="Dashboard"
              >
                <Settings className="h-5 w-5" />
              </Link>
            )}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 text-gray-300 hover:text-accent"
                >
                  {linkedMember ? (
                    <>
                      <img
                        src={linkedMember.image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167'}
                        alt={linkedMember.display}
                        className="w-8 h-8 rounded-full object-cover border border-gray-700"
                      />
                      <span>{linkedMember.display}</span>
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5" />
                      <span>{currentUser.displayName}</span>
                    </>
                  )}
                </button>
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-20">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleAuthClick}
                className="bg-accent hover:bg-accent/90 px-4 py-2 rounded-md transition-colors"
              >
                Connexion
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {currentUser?.role === 'admin' && (
              <Link
                to="/dashboard"
                className="text-gray-300 hover:text-accent transition-colors"
                title="Dashboard"
              >
                <Settings className="h-5 w-5" />
              </Link>
            )}
            <button
              className="text-gray-300"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-300 hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/organization"
              className="block px-3 py-2 text-gray-300 hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Organisation
            </Link>
            <Link
              to="/fleet-manager"
              className="block px-3 py-2 text-gray-300 hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Fleet Manager
            </Link>
            <Link
              to="/tools"
              className="block px-3 py-2 text-gray-300 hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Outils
            </Link>
            <Link
              to="/blog"
              className="block px-3 py-2 text-gray-300 hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Verse News
            </Link>
            <Link
              to="/planning"
              className="block px-3 py-2 text-gray-300 hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Planning
            </Link>
            {currentUser ? (
              <>
                <div className="px-3 py-2 text-gray-300">
                  {linkedMember ? linkedMember.display : currentUser.displayName}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:text-accent"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  handleAuthClick();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-colors"
              >
                Connexion
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;