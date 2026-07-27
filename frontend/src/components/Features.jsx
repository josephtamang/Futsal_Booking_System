import { motion } from "framer-motion";
import calendarIcon from "../assets/icons/calendar.svg";
import locationIcon from "../assets/icons/location.svg";
import shieldIcon from "../assets/icons/shield.svg";

const features = [
  {
    icon: calendarIcon,
    title: "Easy Booking",
    description:
      "Book your preferred futsal court and time slot in just a few clicks.",
  },
  {
    icon: locationIcon,
    title: "Nearby Futsals",
    description:
      "Find futsal grounds near your location with smart recommendations.",
  },
  {
    icon: shieldIcon,
    title: "Secure System",
    description:
      "Your bookings and data are protected with a secure authentication system.",
  },
];

function Features() {
  return (
    <section className="bg-slate-900 text-slate-100 py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold"
        >
          Why Choose RinCon<span className="text-emerald-400">FutBuk?</span>
        </motion.h2>

        <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
          Everything you need to book futsal courts quickly, safely, and without
          hassle.
        </p>

        {/* Feature Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-slate-800 rounded-2xl p-8 hover:shadow-xl hover:shadow-emerald-500/10 transition"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-emerald-500/10 p-4 rounded-xl">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-12 h-12 filter invert sepia saturate-200 hue-rotate-[110deg]"
                  />
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>

              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
