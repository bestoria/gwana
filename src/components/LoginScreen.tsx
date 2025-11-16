import React, { useState, useRef } from 'react';
import { Logo } from './Logo';
import { countries } from '@/src/lib/countries';
import type { Country } from '@/src/lib/types';
import { Loader } from 'lucide-react';
import ApiKeyInput from './ApiKeyInput';

interface LoginScreenProps {
  onLogin: (phone: string, pin: string) => Promise<{ success: boolean; message: string }>;
  onSignup: (name: string, phone: string, pin: string, gender: 'male' | 'female' | null) => Promise<{ success: boolean; message: string }>;
}

const PinInput: React.FC<{ length: number; onChange: (pin: string) => void }> = ({ length, onChange }) => {
    const [pins, setPins] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const { value } = e.target;
      if (/^[0-9]$/.test(value) || value === '') {
        const newPins = [...pins];
        newPins[index] = value;
        setPins(newPins);
        onChange(newPins.join(''));
        if (value && index < length - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    };
  
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Backspace' && !pins[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };
  
    return (
      <div className="pin-input-container">
        {pins.map((pin, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="password"
            maxLength={1}
            value={pin}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="pin-input"
            inputMode="numeric"
          />
        ))}
      </div>
    );
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries.find(c => c.code === 'NG')!);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !name.trim()) {
        setError('Please enter your name.');
        return;
    }
    if (!isLogin && !gender) {
        setError('Please select a gender.');
        return;
    }
    if (pin.length !== 6) {
        setError('PIN must be 6 digits.');
        return;
    }

    setIsLoading(true);

    const fullPhoneNumber = `${selectedCountry.dial_code}${phone.replace(/\D/g, '')}`;
    let result;
    if (isLogin) {
      result = await onLogin(fullPhoneNumber, pin);
    } else {
      result = await onSignup(name, fullPhoneNumber, pin, gender);
    }

    if (!result.success) {
      setError(result.message);
    }
    // On success, the useAuth hook will handle the UI change.
    setIsLoading(false);
  };
  
  const handlePinChange = (newPin: string) => {
    setPin(newPin);
    if(error) setError('');
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    const result = await onLogin('+10001112222', '123456');
    if (!result.success) {
        setError(result.message);
    }
    // On success, the useAuth hook will handle the UI change.
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0a0a1a] to-[#1a1a2e] p-4 text-white font-mono login-container">
      <ApiKeyInput />
      <div className="w-full max-w-md bg-black/30 backdrop-blur-md border border-[var(--border-color)] p-8 rounded-lg shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <Logo persona="Agent Zero" />
          <h1 className="header-title text-3xl mt-4">Webzero</h1>
          <p className="text-sm text-gray-400 mt-1">Your Personal AI Companion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
                <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-black/50 border border-[var(--border-color)] rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                    <div className="grid grid-cols-2 gap-2 border border-[var(--border-color)] rounded-lg p-1">
                        <button type="button" onClick={() => setGender('male')} className={`px-4 py-2 rounded-md text-sm transition-colors ${gender === 'male' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-700'}`}>Male</button>
                        <button type="button" onClick={() => setGender('female')} className={`px-4 py-2 rounded-md text-sm transition-colors ${gender === 'female' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-700'}`}>Female</button>
                    </div>
                </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
            <div className="phone-input-container">
                <button type="button" onClick={() => setIsCountryModalOpen(true)} className="country-picker-btn">
                    <span>{selectedCountry.flag}</span>
                    <span className="text-sm">{selectedCountry.dial_code}</span>
                </button>
                 <div className="w-px h-6 bg-[var(--border-color)]"></div>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder={selectedCountry.pattern || '... ... ....'}
                    className="flex-1 bg-transparent p-3 text-sm focus:outline-none"
                />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">6-Digit PIN</label>
            <PinInput length={6} onChange={handlePinChange} />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors disabled:bg-gray-600 flex items-center justify-center"
          >
            {isLoading ? <><Loader size={20} className="animate-spin mr-2" /> Processing...</> : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-semibold text-cyan-400 hover:underline">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>

        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs">OR</span>
            <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-600 flex items-center justify-center"
        >
            {isLoading ? <><Loader size={20} className="animate-spin mr-2" /> Processing...</> : 'Enter Demo Mode'}
        </button>

      </div>

      {isCountryModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setIsCountryModalOpen(false)}>
              <div className="bg-black/80 border border-gray-700 rounded-lg w-full max-w-sm h-[70vh] flex flex-col p-4" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-bold mb-4 text-center">Select Country</h3>
                  <div className="flex-1 overflow-y-auto country-modal-list">
                      {countries.map(country => (
                          <button key={country.code} onClick={() => { setSelectedCountry(country); setIsCountryModalOpen(false); }} className="w-full flex items-center gap-4 p-2 hover:bg-gray-700 rounded-md text-left">
                              <span>{country.flag}</span>
                              <span className="flex-1">{country.name}</span>
                              <span className="text-gray-400">{country.dial_code}</span>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default LoginScreen;