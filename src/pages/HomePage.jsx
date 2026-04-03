import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import event1 from '../assets/img/event1.png';
import event2 from '../assets/img/event2.png';
import event5 from '../assets/img/event5.png';
import logo from '../assets/img/logo.PNG';
import officer1 from '../assets/img/officer1.png';
import officer2 from '../assets/img/officer2.jpg';
import officer3 from '../assets/img/officer3.png';
import officer4 from '../assets/img/officer4.png';
import FINALGBM2 from '../assets/img/FINALGBM2.png';
import PT from '../assets/img/PT.png';

export default function HomePage() {
  useEffect(() => {
    const layers = document.querySelectorAll('.layer');
    let dragItem = null;
    let offsetX = 0;
    let offsetY = 0;

    function onPointerMove(event) {
      const x = (event.clientX / window.innerWidth - 0.5) * 20;
      const y = (event.clientY / window.innerHeight - 0.5) * 20;

      layers.forEach((element, index) => {
        const depth = Number.parseFloat(element.dataset.depth || `${((index % 5) + 1) * 0.5}`);
        element.style.setProperty('--px', `${x * depth}px`);
        element.style.setProperty('--py', `${y * depth}px`);
      });

      if (dragItem) {
        dragItem.style.left = `${event.clientX - offsetX}px`;
        dragItem.style.top = `${event.clientY - offsetY}px`;
      }
    }

    function onPointerUp() {
      if (dragItem) {
        dragItem.classList.remove('dragging');
        dragItem = null;
      }
    }

    layers.forEach((element) => {
      if (!element.dataset.depth) {
        element.dataset.depth = '1';
      }

      function onPointerDown(event) {
        dragItem = element;
        const rect = element.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        element.classList.add('dragging');
        event.preventDefault();
      }

      element.style.touchAction = 'none';
      element.addEventListener('pointerdown', onPointerDown);
      element.__dragHandler = onPointerDown;
    });

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);

      layers.forEach((element) => {
        if (element.__dragHandler) {
          element.removeEventListener('pointerdown', element.__dragHandler);
          delete element.__dragHandler;
        }
      });
    };
  }, []);

  return (
    <>
      <div className="playing-card layer" style={{ top: '18%', left: '4%' }}>
        <div className="rank">A</div>
        <div className="suit text-black">♠</div>
        <div className="rank self-end">A</div>
      </div>
      <div className="playing-card layer" style={{ top: '22%', right: '8%' }}>
        <div className="rank text-red-600">Q</div>
        <div className="suit text-red-600">♦</div>
        <div className="rank text-red-600 self-end">Q</div>
      </div>
      <div className="playing-card layer" style={{ top: '55%', left: '75%' }}>
        <div className="rank text-red-600">K</div>
        <div className="suit text-red-600">♥</div>
        <div className="rank text-red-600 self-end">K</div>
      </div>
      <div className="playing-card layer" style={{ top: '65%', left: '10%' }}>
        <div className="rank">J</div>
        <div className="suit text-black">♣</div>
        <div className="rank self-end">J</div>
      </div>

      <div className="poker-chip layer" style={{ top: '60%', right: '5%', zIndex: 0 }} />
      <div className="poker-chip layer" style={{ top: '72%', left: '25%', zIndex: 0 }} />
      <div className="poker-chip layer" style={{ top: '30%', left: '40%', zIndex: 0 }} />
      <div className="poker-chip layer" style={{ top: '15%', right: '35%', zIndex: 0 }} />

      <nav className="p-6 flex justify-between items-center bg-blue-950 bg-opacity-60 backdrop-blur-md fixed w-full z-10">
        <div className="flex items-center space-x-4">
          <img src={logo} alt="NCAT Poker Club Logo" className="h-10 w-10 object-contain" />
          <h1 className="text-2xl font-bold text-yellow-400">NCAT Poker Club</h1>
        </div>
        <div className="space-x-6 nav-links">
          <a href="#about" className="hover:text-yellow-300">About</a>
          <a href="#officers" className="hover:text-yellow-300">Officers</a>
          <a href="#sponsors" className="hover:text-yellow-300">Sponsors</a>
          <a href="#events" className="hover:text-yellow-300">Events</a>
          <Link to="/leaderboard" className="hover:text-yellow-300">Leaderboard</Link>
        </div>
      </nav>

      <section className="hero h-screen flex flex-col justify-center items-center text-center px-4">
        <h2 className="text-5xl font-bold text-yellow-400 mb-4">Welcome to the Table</h2>
        <p className="max-w-xl text-lg">The official poker community at North Carolina A&T State University.</p>
      </section>

      <section id="about" className="py-20 px-8 bg-blue-900 bg-opacity-40 site-section">
        <h2 className="text-4xl font-bold text-yellow-400 mb-6">About Us</h2>
        <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
          <div className="md:flex-1">
            <p className="max-w-3xl">
              The North Carolina A&T Poker Club creates a social and educational environment for students
              interested in the strategic and recreational aspects of poker. We promote responsible,
              skill-based gameplay through regular meetings, tournaments, and workshops that foster
              sportsmanship and critical thinking.
            </p>
            <br />
            <p className="max-w-3xl">
              Beyond the cards, we are committed to our members&apos; professional growth. By connecting
              strategic gameplay to real-world applications, we highlight how the competencies developed at
              the table, like risk assessment and emotional intelligence, translate to successful careers.
              Through networking, guest speakers, and alumni engagement, we help Aggies build transferable
              skills and expand their professional networks for life after graduation.
            </p>
          </div>
          <div className="md:flex-1 mt-8 md:mt-0 flex justify-center">
            <div className="w-full max-w-md h-64 bg-gray-700 bg-opacity-0 rounded-lg flex items-center justify-center text-gray-300">
              <img src={logo} alt="NCAT Poker Club Logo" className="h-50 w-50 object-contain" />
            </div>
          </div>
        </div>
      </section>

      <section id="officers" className="py-20 px-8 site-section">
        <h2 className="text-4xl font-bold text-yellow-400 mb-10">Officers</h2>
        <div className="grid md:grid-cols-4 gap-10">
          <div className="flip-card">
            <div className="flip-inner">
              <div className="flip-front flex items-center justify-center">
                <img src={officer1} alt="President" className="w-full h-full object-cover rounded-2xl" />
              </div>
              <div className="flip-back flex flex-col justify-center items-center p-4">
                <h3 className="text-xl font-bold">President</h3>
                <p>Ambrose Yancey</p>
              </div>
            </div>
          </div>

          <div className="flip-card">
            <div className="flip-inner">
              <div className="flip-front flex items-center justify-center">
                <img src={officer2} alt="Vice President" className="w-full h-full object-cover rounded-2xl" />
              </div>
              <div className="flip-back flex flex-col justify-center items-center p-4">
                <h3 className="text-xl font-bold">Vice President</h3>
                <p>Staci Tranquille</p>
              </div>
            </div>
          </div>

          <div className="flip-card">
            <div className="flip-inner">
              <div className="flip-front flex items-center justify-center">
                <img src={officer3} alt="Treasurer" className="w-full h-full object-cover rounded-2xl" />
              </div>
              <div className="flip-back flex flex-col justify-center items-center p-4">
                <h3 className="text-xl font-bold">Treasurer</h3>
                <p>Darrell Pratt</p>
              </div>
            </div>
          </div>

          <div className="flip-card">
            <div className="flip-inner">
              <div className="flip-front flex items-center justify-center">
                <img src={officer4} alt="Secretary" className="w-full h-full object-cover rounded-2xl" />
              </div>
              <div className="flip-back flex flex-col justify-center items-center p-4">
                <h3 className="text-xl font-bold">Secretary</h3>
                <p>Ryan Bolt</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sponsors" className="py-20 px-8 bg-blue-900 bg-opacity-40 site-section">
        <h2 className="text-4xl font-bold text-yellow-400 mb-10">Partners & Sponsors</h2>
        <p className="max-w-6xl">
          If you are interested in sponsoring the NCAT Poker Club or partnering with us for events, please
          reach out to us at{' '}
          <a href="mailto:ncat.pokerclub@gmail.com" className="text-yellow-400 hover:underline">
            ncat.pokerclub@gmail.com
          </a>
        </p>
      </section>

      <section id="events" className="py-20 px-8 site-section">
        <h2 className="text-4xl font-bold text-yellow-400 mb-10">Events</h2>
        <div className="max-w-4xl mx-auto space-y-16">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-6">Upcoming</h3>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-blue-800 bg-opacity-50 rounded-lg overflow-hidden shadow-lg">
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSeYgRM4uSEGabIm5WOmK6gCPIU9P1cED_zBnKhvS_8HdT9ICQ/viewform?usp=header" target="_blank" rel="noopener noreferrer"><img src={FINALGBM2} alt="General Body Meeting" className="w-full h-100 object-cover" /></a>
                <div className="p-4">
                  <p className="text-sm text-yellow-300">April 9th, 2026</p>
                  <h4 className="text-lg font-semibold text-white">Final General Body Meeting</h4>
                  <p className="text-white text-sm mt-2">Career Night! Join us for a panel discussion with an industry professional from NVIDIA, followed by a night of poker and socializing.</p>
                </div>
              </div>
              <div className="bg-blue-800 bg-opacity-50 rounded-lg overflow-hidden shadow-lg">
                <div className="event-flyer-frame">
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSfcMvCE2jgfEdNzRy5LQHkC-IVkHDqF82ON2RSHPnqKlHlApw/viewform?usp=header" target="_blank" rel="noopener noreferrer"><img src={PT} alt="Poker Tournament" className="w-full h-100 object-cover" /> </a>
                </div>
                <div className="p-4">
                  <p className="text-sm text-yellow-300">April 20th, 2026</p>
                  <h4 className="text-lg font-semibold text-white">Poker Tournament</h4>
                  <p className="text-white text-sm mt-2">Join us for our first annual poker tournament!</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-6">Past</h3>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-blue-800 bg-opacity-50 rounded-lg overflow-hidden shadow-lg">
                <img src={event1} alt="First General Body Meeting" className="w-full h-40 object-cover" />
                <div className="p-4">
                  <p className="text-sm text-yellow-300">February 16, 2026</p>
                  <h4 className="text-lg font-semibold text-white">First General Body Meeting</h4>
                  <p className="text-white text-sm mt-2">
                    We had our first general body meeting where we had the director of cybersecurity at Metlife
                    talk about their experience and advice for students interested in cybersecurity. We ended the
                    night teaching scholars how to play poker and playing a few rounds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-6 bg-blue-950 bg-opacity-80 backdrop-blur-md border-t border-yellow-400/40">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-6 text-center text-sm">
          <a href="mailto:pokerclub@ncat.edu" className="flex items-center gap-2 group transition">
            <p className="group-hover:text-yellow-300">ncat.pokerclub@gmail.com</p>
          </a>
          <a
            href="https://www.instagram.com/ncat_pokerclub/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 group transition"
          >
            <p className="group-hover:text-yellow-300">@ncat_pokerclub</p>
          </a>
        </div>
      </footer>
    </>
  );
}
