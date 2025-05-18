import { Link } from 'react-router-dom';
import voyageLogo from '../assets/voyage-logo.png';

const NotFound = () => {

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-25 max-w-4xl">
                <div className="w-64 h-64 relative flex items-center justify-center mb-6 md:mb-0">
                    <div className="absolute w-full h-full bg-base-200 rounded-full opacity-20"></div>
                    <img
                        src={voyageLogo}
                        alt="Voyage Logo"
                        className="w-84 h-84 object-contain"
                    />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full border-t-4 border-r-4 border-primary rounded-full opacity-70"
                    ></div>
                </div>

                <div className="text-center md:text-left">
                    <h1 className="text-8xl font-bold text-primary mb-2">404</h1>
                    <h2 className="text-xl font-semibold text-base-content tracking-wider mb-1">LOOKS LIKE YOU'RE LOST</h2>
                    <p className="text-base-content opacity-70 mb-8">
                        The page you are looking for is not available!
                    </p>

                    <Link to="/" className="btn btn-primary inline-flex items-center gap-2">
                        GO TO HOME
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound; 