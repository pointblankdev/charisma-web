import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function FAQ() {
  return (
    <section className="py-24 bg-[#050111] text-center">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-white">Frequently Asked Questions</h2>
        <div className="mt-12 space-y-8">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

export function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFAQ = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border border-charcoalGrey rounded-lg overflow-hidden relative z-50">
      <button
        onClick={toggleFAQ}
        className="w-full flex justify-between items-center bg-darkGrey px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-expanded={isOpen}
      >
        <span className="text-left text-lg font-medium">{question}</span>
        {isOpen ? (
          <FaChevronUp className="text-primary text-xl" />
        ) : (
          <FaChevronDown className="text-lightGrey text-xl" />
        )}
      </button>
      <div
        className={`px-4 pb-4 text-lightGrey transition-max-height duration-500 ease-in-out ${
          isOpen ? 'max-h-40' : 'max-h-0'
        } overflow-hidden`}
      >
        <p className="mt-2 text-left">{answer}</p>
      </div>
    </div>
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
