import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  CreditCard,
  Smartphone,
  Building,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { bookingAPI } from '../services/api';

export default function CheckoutModal({
  isOpen,
  onClose,
  bookingDetails,
  onBookingSuccess,
}) {
  const [paymentMethod, setPaymentMethod] = useState('simulated_upi');
  const [upiId, setUpiId] = useState('player@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600); // 10 minutes hold

  // Timer countdown
  useEffect(() => {
    if (!isOpen || confirmedBooking) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setError('Your 10-minute temporary hold has expired. Please select the slot again.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, confirmedBooking]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;

  const handleSimulatedPayment = async e => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const payload = {
        venueId: bookingDetails.venueId,
        playingAreaId: bookingDetails.playingAreaId,
        sport: bookingDetails.sport,
        date: bookingDetails.date,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        paymentMethod,
        sessionToken: bookingDetails.sessionToken,
      };

      const res = await bookingAPI.checkout(payload);

      if (res.data.success) {
        setConfirmedBooking(res.data.booking);
        // Fire confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}

        if (onBookingSuccess) {
          onBookingSuccess(res.data.booking);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Slot booking failed. Please try again or choose another slot.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-charcoal-900 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-sm">
              ₹
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">
                {confirmedBooking ? 'Booking Confirmed!' : 'Confirm Ground Booking'}
              </h2>
              <span className="text-xs text-gray-400">
                {confirmedBooking ? 'Slot successfully reserved' : 'Simulated Instant Checkout'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Confirmed State View */}
          {confirmedBooking ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-gray-900">Slot Confirmed!</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Your booking receipt has been generated in your account.
                </p>
              </div>

              {/* Booking Summary Box */}
              <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-200/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking ID:</span>
                  <span className="font-mono font-bold text-gray-900">{confirmedBooking.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Venue:</span>
                  <span className="font-semibold text-gray-900">{confirmedBooking.venueName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Playing Area:</span>
                  <span className="font-medium text-gray-800">{confirmedBooking.playingAreaName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sport:</span>
                  <span className="font-medium text-gray-800">{confirmedBooking.sport}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date & Slot:</span>
                  <span className="font-bold text-brand-600">
                    {confirmedBooking.date} • {confirmedBooking.startTime} - {confirmedBooking.endTime}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-700">Total Paid (Simulated):</span>
                  <span className="font-black text-sm text-gray-900">₹{confirmedBooking.totalAmountInr}</span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-medium">
                ⚠️ DEMO PAYMENT — NO REAL MONEY WAS CHARGED
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form View */
            <form onSubmit={handleSimulatedPayment} className="space-y-4">
              {/* Concurrency Hold Timer */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                <div className="flex items-center gap-2 text-rose-700 font-medium">
                  <Clock className="w-4 h-4 text-brand-600 animate-pulse" />
                  <span>Temporary Slot Hold Active</span>
                </div>
                <span className="font-mono font-bold text-brand-700 text-sm">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>

              {/* Slot Details Review */}
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Venue:</span>
                  <span className="font-semibold text-gray-900">{bookingDetails.venueName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sport & Area:</span>
                  <span className="font-medium text-gray-800">
                    {bookingDetails.sport} • {bookingDetails.playingAreaName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date & Slot:</span>
                  <span className="font-bold text-brand-600">
                    {bookingDetails.date} ({bookingDetails.startTime} - {bookingDetails.endTime})
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Simulated Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('simulated_upi')}
                    className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition ${
                      paymentMethod === 'simulated_upi'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('simulated_card')}
                    className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition ${
                      paymentMethod === 'simulated_card'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('simulated_netbanking')}
                    className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition ${
                      paymentMethod === 'simulated_netbanking'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Netbanking</span>
                  </button>
                </div>
              </div>

              {/* Simulated input */}
              {paymentMethod === 'simulated_upi' && (
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Virtual Payment Address (UPI ID)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-brand-500 font-mono"
                    placeholder="yourname@okhdfcbank"
                  />
                </div>
              )}

              {/* Price Calculation Box */}
              <div className="bg-gray-100/70 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Slot Base Hourly Fee</span>
                  <span>₹{bookingDetails.originalPriceInr}</span>
                </div>
                {bookingDetails.discountInr > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Promotional Discount Applied</span>
                    <span>-₹{bookingDetails.discountInr}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5 border-t border-gray-200 font-bold text-sm text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-brand-600">₹{bookingDetails.finalPriceInr}</span>
                </div>
              </div>

              {/* Prominent Demo Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-[11px] text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Academic Project Testing:</strong> This is a simulation payment mode.
                  No real bank account or card will be charged.
                </span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || timeLeftSeconds <= 0}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-gray-400 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Slot Concurrency & Locking...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay ₹{bookingDetails.finalPriceInr} (Simulated) & Confirm Slot</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
