export default function FAQ() {
  return (
    <section className="py-24 bg-black text-center">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-white">Frequently Asked Questions</h2>
        <div className="mt-12">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="mb-8 text-left">
      <h3 className="text-xl font-semibold text-white">{question}</h3>
      <p className="text-lightGrey mt-2">{answer}</p>
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
  }
  // Additional FAQs...
];
