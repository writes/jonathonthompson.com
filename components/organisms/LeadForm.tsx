'use client';

import { useState } from 'react';
import { Text, Field } from '@sitecore-jss/sitecore-jss-nextjs';

export type LeadFormFields = {
  title: Field<string>;
  submitText?: Field<string>;
};

export function LeadForm(props: any) {
  const fields = props.fields as LeadFormFields;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('Form submitted!');
    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="lead-form p-8 bg-gray-100 max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4">
        <Text field={fields.title} />
      </h2>
      <div className="mb-4">
        <label htmlFor="name" className="block">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 border"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="message" className="block">
          Message
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          className="w-full p-2 border"
          rows={4}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? (
          'Submitting...'
        ) : (
          <Text field={fields.submitText ?? ({ value: 'Submit' } as any)} />
        )}
      </button>
    </form>
  );
}
