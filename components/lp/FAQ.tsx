import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function FAQ() {
  return (
    <section className="py-24 bg-[#111016] text-center -mx-4">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff8a00] to-[#e52e71]"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.div
          className="mt-12 space-y-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
          }}
        >
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="border border-charcoalGrey rounded-lg overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center bg-darkGrey px-6 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-expanded={isOpen}
      >
        <span className="text-left text-lg font-medium text-white">{question}</span>
        {isOpen ? (
          <FaChevronUp className="text-primary text-xl" />
        ) : (
          <FaChevronDown className="text-lightGrey text-xl" />
        )}
      </button>
      <div
        className={`bg-[#111016] px-6 text-lightGrey transition-max-height duration-500 ease-in-out ${
          isOpen ? 'max-h-40 py-4' : 'max-h-0'
        } overflow-hidden`}
      >
        <p className="mt-2 text-left">{answer}</p>
      </div>
    </motion.div>
  );
}

const faqs = [
  {
    question: 'What is Charisma?',
    answer:
      'Charisma is a platform designed for decentralized governance and community-driven growth, empowering users to manage their digital assets effectively.'
  },
  {
    question: 'How do I get started?',
    answer:
      'Simply sign up and connect your digital wallet to begin exploring the features and capabilities of the Charisma platform.'
  },
  {
    question: 'What are the benefits of decentralized governance?',
    answer:
      'Decentralized governance ensures transparency, inclusivity, and democratic decision-making, allowing every community member to have a say in the platform’s direction.'
  },
  {
    question: 'Is Charisma secure?',
    answer:
      'Absolutely. Charisma employs advanced security protocols and regular audits to ensure the safety and integrity of your digital assets.'
  }
];
