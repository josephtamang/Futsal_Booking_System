import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import about1 from "../assets/about.mp4";
import about2 from "../assets/about.png";

function AboutUs() {
  return (
    <div className="pt-24 bg-slate-950 text-slate-100 overflow-hidden">
      {/* HERO SECTION */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center bg-cover-fit bg-center"
        style={{
          backgroundImage:
            `url(${about2})`,
        }}
      >
        <div className="absolute inset-0 bg-black/70" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-center px-6 max-w-3xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-emerald-400">
            About RinCon FutBuk
          </h1>
          <p className="text-lg text-slate-300">
            A smart and simple futsal booking platform designed to save time,
            reduce confusion, and make booking courts effortless.
          </p>
        </motion.div>
      </section>

      {/* WHO WE ARE */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl font-semibold mb-4">Who We Are</h2>
          <p className="text-slate-300 leading-relaxed text-justify">
            RinCon FutBuk is a modern web-based futsal booking system built to
            connect players with futsal venues in a fast, reliable, and
            user-friendly way. Our goal is to eliminate manual booking problems,
            phone calls, schedule confusion, and unavailable slots by providing
            a centralized digital solution.
            In today’s fast-paced lifestyle, players often struggle to find
            available courts at the right time. RinCon FutBuk solves this
            problem by allowing users to explore nearby futsal venues, view
            real-time court availability, and book slots instantly with just a
            few clicks. <br /> <br />
            The system is designed to be simple and accessible for everyone —
            whether you are a professional player, a group of friends planning a
            weekend match, or someone booking a futsal court for the first time.
            No technical knowledge is required to use the platform. 
            RinCon FutBuk also supports futsal owners and administrators by
            providing powerful management tools. Admins can easily add futsals,
            manage courts, configure time slots, track bookings, and handle
            cancellations through a secure dashboard, reducing workload and
            improving operational efficiency. <br /> <br />
            By combining modern web technologies, responsive design, and
            real-world booking logic, RinCon FutBuk creates a smooth and
            transparent booking experience for both players and futsal
            operators. Our platform aims to save time, reduce errors, and make
            futsal booking smarter, faster, and more enjoyable for everyone.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-slate-900 rounded-2xl p-8 shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-3 text-emerald-400">
            System Video Demo
          </h3>

          <p className="text-slate-300 mb-4 leading-relaxed">
            Watch this short demo to understand how RinCon FutBuk works — from
            exploring futsal venues to booking a time slot and managing your
            bookings easily.
          </p>

          {/* Video Container */}
          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700">
            {/* OPTION 1: YouTube video */}
            {/* <iframe
      className="w-full h-full"
      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
      title="RinCon FutBuk Demo"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    /> */}

            {/* OPTION 2: Local MP4 (use later) */}
            <video
              controls
              className="w-full h-full object-cover"
              poster="/demo-thumbnail.jpg"
            >
              <source src={about1} type="video/mp4" />
            </video>
          </div>

          <p className="text-xs text-slate-400 mt-3">
            Tip: This demo is designed for first-time users and non-technical
            players.
          </p>
        </motion.div>
      </section>

      {/* HOW TO USE */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-center mb-12"
          >
            How to Use the System
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "Step 1",
                title: "Create an Account",
                desc: "Register using your name, email, and phone number to access booking features.",
              },
              {
                step: "Step 2",
                title: "Explore Futsals",
                desc: "Browse nearby futsal venues, courts, and available time slots.",
              },
              {
                step: "Step 3",
                title: "Book a Slot",
                desc: "Select your preferred date and time, then confirm your booking.",
              },
              {
                step: "Step 4",
                title: "Manage Bookings",
                desc: "View, track, or cancel your bookings easily from your dashboard.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-slate-800 rounded-xl p-6 text-center shadow-md"
              >
                <span className="text-emerald-400 font-semibold">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold mt-2 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-300">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto px-6 bg-slate-800 p-10"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
          <p className="text-slate-300 mb-6">
            Join RinCon FutBuk today and experience a smarter way to book futsal
            courts.
          </p>
          <Link
            to="/register"
            className="inline-block bg-emerald-500 text-slate-900 px-8 py-3 rounded-full font-semibold hover:bg-emerald-400 transition"
          >
            Create Account
          </Link>
        </motion.div>
      </section>
      <hr />
    </div>
  );
}

export default AboutUs;
