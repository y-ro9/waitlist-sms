import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { resetDB } from '../data/store';

beforeEach(() => {
  localStorage.clear();
  resetDB();
  vi.restoreAllMocks();
});

describe('App', () => {
  it('renders the main header', async () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { level: 1, name: /class waitlist sms notification/i }),
    ).toBeInTheDocument();
  });

  it('shows a loading indicator on initial load', () => {
    render(<App />);
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });

  it('shows "No data found" empty state when search yields nothing', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getByLabelText(/select class/i)).toBeInTheDocument());
    const search = await screen.findByLabelText(/search waitlist/i);
    await user.type(search, 'zzz-nothing-matches');
    const empties = await screen.findAllByText(/no data found/i);
    expect(empties.length).toBeGreaterThan(0);
  });

  it('adds a student and shows it in the table', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getByLabelText(/select class/i)).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /add student/i }));
    await user.type(screen.getByLabelText(/full name/i), 'New Student');
    await user.type(screen.getByLabelText(/phone/i), '+919812341234');
    await user.type(screen.getByLabelText(/email/i), 'new@student.com');
    await user.click(screen.getByRole('button', { name: /add to waitlist/i }));

    expect(await screen.findByText('New Student')).toBeInTheDocument();
  });

  it('shows validation errors when form is submitted empty', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getByLabelText(/select class/i)).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /add student/i }));
    await user.click(screen.getByRole('button', { name: /add to waitlist/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/phone is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('fires the analytics log when a Notify button is clicked', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /notify .* via sms/i }).length).toBeGreaterThan(0),
    );
    await user.click(screen.getAllByRole('button', { name: /notify .* via sms/i })[0]);

    const matched = logSpy.mock.calls.some((args) =>
      String(args[0]).includes(
        '[Analytics] User interacted with Class Waitlist SMS Notification Job (Twilio Mock)',
      ),
    );
    expect(matched).toBe(true);
  });

  it('sends an SMS and updates the log panel', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /notify .* via sms/i }).length).toBeGreaterThan(0),
    );
    await user.click(screen.getAllByRole('button', { name: /notify .* via sms/i })[0]);

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /send sms/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 3000,
    });
    expect(screen.getByText('sent')).toBeInTheDocument();
  });
});