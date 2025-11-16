import React, { useState, useRef } from 'react';
import { Logo } from './Logo';
import { countries } from '@/src/lib/countries';
import type { Country } from '@/src/lib/types';
import { Loader } from 'lucide-react';
import ApiKeyInput from './ApiKeyInput';
import CyberpunkContainer from './layouts/CyberpunkContainer';
import HolographicPanel from './cyberpunk/HolographicPanel';
import HolographicText from './cyberpunk/HolographicText';
import CyberpunkInput from './cyberpunk/CyberpunkInput';
import NeonButton from './cyberpunk/NeonButton';
import CyberpunkModal from './cyberpunk/CyberpunkModal';

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
    <CyberpunkContainer aiMode="chat">
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white font-mono">
        <ApiKeyInput />
        
        <div className="w-full max-w-md animate-scale-in">
          <HolographicPanel glowColor="cyan" withCorners withScanlines withGrid>
            <div className="p-8">
              <div className="flex flex-col items-center mb-8">
                <Logo persona="Agent Zero" />
                <HolographicText className="text-3xl mt-4 font-bold cyber-heading" glowColor="cyan" flickerEffect>
                  Webzero
                </HolographicText>
                <p className="text-sm text-gray-400 mt-2 cyber-body">Your Personal AI Companion</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-cyan-400 mb-2 uppercase tracking-wider">Full Name</label>
                      <CyberpunkInput
                        value={name}
                        onChange={setName}
                        placeholder="Enter your name"
                        glowColor="cyan"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-cyan-400 mb-2 uppercase tracking-wider">Gender</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setGender('male')}
                          className={`px-4 py-3 rounded-lg text-sm font-bold uppercase transition-all border-2 ${
                            gender === 'male'
                              ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
                              : 'bg-black/20 border-gray-700 text-gray-400 hover:border-cyan-600'
                          }`}
                          style={{
                            boxShadow: gender === 'male' ? '0 0 15px var(--accent-cyan)60' : 'none'
                          }}
                        >
                          👨‍💼 Male
                        </button>
                        <button
                          type="button"
                          onClick={() => setGender('female')}
                          className={`px-4 py-3 rounded-lg text-sm font-bold uppercase transition-all border-2 ${
                            gender === 'female'
                              ? 'bg-magenta-600/30 border-magenta-400 text-magenta-300'
                              : 'bg-black/20 border-gray-700 text-gray-400 hover:border-magenta-600'
                          }`}
                          style={{
                            boxShadow: gender === 'female' ? '0 0 15px var(--accent-magenta)60' : 'none'
                          }}
                        >
                          👩‍💼 Female
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-cyan-400 mb-2 uppercase tracking-wider">Phone Number</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCountryModalOpen(true)}
                      className="px-3 py-2 bg-black/50 backdrop-blur-md border-2 rounded-lg flex items-center gap-2 transition-all hover:border-cyan-400"
                      style={{
                        borderColor: 'var(--accent-cyan)',
                        boxShadow: '0 0 10px var(--accent-cyan)40'
                      }}
                    >
                      <span className="text-2xl">{selectedCountry.flag}</span>
                      <span className="text-sm font-mono text-cyan-400">{selectedCountry.dial_code}</span>
                    </button>
                    <CyberpunkInput
                      value={phone}
                      onChange={setPhone}
                      type="tel"
                      placeholder={selectedCountry.pattern || '... ... ....'}
                      glowColor="cyan"
                      className="flex-1"
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
      </HolographicPanel>
    </div>

    <CyberpunkModal
      isOpen={isCountryModalOpen}
      onClose={() => setIsCountryModalOpen(false)}
      title="Select Country"
      glowColor="cyan"
      size="sm"
    >
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {countries.map(country => (
          <button
            key={country.code}
            onClick={() => { setSelectedCountry(country); setIsCountryModalOpen(false); }}
            className="w-full flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-cyan-600/20 border border-transparent hover:border-cyan-400"
          >
            <span className="text-2xl">{country.flag}</span>
            <span className="flex-1 text-left">{country.name}</span>
            <span className="text-cyan-400 font-mono">{country.dial_code}</span>
          </button>
        ))}
      </div>
    </CyberpunkModal>
  </div>
</CyberpunkContainer>
  );
};

export default LoginScreen;