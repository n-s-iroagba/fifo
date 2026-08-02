'use client'
import { useState, useEffect, Suspense } from 'react';
import { useApiQuery, useApiMutation } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';

function ProfileContent() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect');
    const { data, isLoading, refetch } = useApiQuery<any>(['auth', 'me'], '/auth/me');
    const [successMessage, setSuccessMessage] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        address: '',
        city: '',
        state: '',
        country: '',
        countryOfResidence: '',
        zipCode: '',
        languages: [] as { language: string, level: string }[]
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (data?.user) {
            const user = data.user;
            setFormData({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                gender: user.gender || '',
                nationality: user.nationality || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                country: user.country || '',
                countryOfResidence: user.countryOfResidence || '',
                zipCode: user.zipCode || '',
                languages: user.languages || []
            });
        }
    }, [data]);

    const updateProfileMutation = useApiMutation('put', '/auth/profile', {
        onSuccess: (response: any) => {
            refetch();
            queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
            // Update local storage for sidebar/nav consistency
            localStorage.setItem('user', JSON.stringify(response.user));
            setSuccessMessage(true);
            setTimeout(() => setSuccessMessage(false), 3000);

            if (redirectPath) {
                setTimeout(() => router.push(redirectPath), 1000);
            } else {
                setTimeout(() => router.push('/dashboard'), 1000);
            }
        }
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.fullName.trim() || formData.fullName.length < 3) {
            newErrors.fullName = 'Legal Full Name must be at least 3 characters.';
        }
        
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required.';
        } else {
            const phoneRegex = /^[\d\s+\-()]{7,20}$/;
            if (!phoneRegex.test(formData.phoneNumber)) {
                newErrors.phoneNumber = 'Invalid phone number format.';
            }
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required.';
        }

        if (!formData.gender) newErrors.gender = 'Please select a gender.';
        if (!formData.nationality) newErrors.nationality = 'Nationality is required.';
        if (!formData.address.trim()) newErrors.address = 'Residential address is required.';
        if (!formData.city.trim()) newErrors.city = 'City is required.';
        if (!formData.state.trim()) newErrors.state = 'State/Province is required.';
        if (!formData.countryOfResidence.trim()) newErrors.countryOfResidence = 'Country of Residence is required.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            const submissionData = {
                ...formData,
                zipCode: formData.zipCode.trim() || '0000'
            };
            updateProfileMutation.mutate(submissionData);
        } else {
            setShowErrorPopup(true);
            // Scroll to first error
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                console.log('Validation failed for:', firstErrorField);
            }
        }
    };

    if (isLoading) return <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Profile...</div>;

    const user = data?.user || {};

    return (
        <div className="font-sans text-blue-900 pb-24 max-w-5xl mx-auto">
            <header className="mb-12">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block mb-2">Account Settings</span>
                <h1 className="text-4xl font-bold text-blue-900 tracking-tight">Professional Profile</h1>
                <p className="text-blue-500 text-sm mt-2 font-medium">Manage your personal information and profile details for applications.</p>
            </header>

            {successMessage && (
                <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Profile Updated Successfully {redirectPath ? '— Redirecting...' : '— Returning to Dashboard'}</p>
                </div>
            )}

            {showErrorPopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-blue-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl border border-red-100 text-center space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                            <span className="material-symbols-outlined text-4xl">warning</span>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight">Identity Audit Failed</h2>
                            <p className="text-[11px] text-blue-500 font-medium leading-relaxed italic px-4">
                                Several professional identity nodes are missing or invalid. Please reconcile all highlighted fields to proceed.
                            </p>
                            <div className="bg-red-50/50 p-4 rounded-xl border border-red-50 text-left">
                                <ul className="space-y-2">
                                    {Object.values(errors).slice(0, 3).map((err, i) => (
                                        <li key={i} className="text-[9px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1 h-1 bg-red-400 rounded-full" />
                                            {err}
                                        </li>
                                    ))}
                                    {Object.keys(errors).length > 3 && (
                                        <li className="text-[9px] font-bold text-red-400 uppercase tracking-widest italic pt-1 border-t border-red-100/50">
                                            + {Object.keys(errors).length - 3} more discrepancies detected
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowErrorPopup(false)}
                            className="w-full bg-blue-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-blue-800 transition-all"
                        >
                            Reconcile Profile
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-12">
                {/* Identity Section */}
                <section className="bg-white p-10 rounded-3xl border border-blue-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-blue-900 rounded-lg text-white">
                            <span className="material-symbols-outlined text-base">person</span>
                        </div>
                        <h2 className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">Personal Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-center gap-6 md:col-span-2 pb-6 border-b border-blue-50">
                            <div className="w-20 h-20 rounded-2xl bg-blue-900 flex items-center justify-center text-white text-3xl font-bold italic">
                                {formData.fullName?.[0] || user.email?.[0] || '?'}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-blue-900">{formData.fullName || 'New Applicant'}</h3>
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Profile Photo Restricted</p>
                            </div>
                        </div>

                        <InputField label="Legal Full Name" value={formData.fullName} onChange={(v: string) => handleInputChange('fullName', v)} error={errors.fullName} />
                        <InputField label="Date of Birth" value={formData.dateOfBirth} onChange={(v: string) => handleInputChange('dateOfBirth', v)} type="date" error={errors.dateOfBirth} />
                        <InputField label="Gender" value={formData.gender} onChange={(v: string) => handleInputChange('gender', v)} options={['Male', 'Female', 'Other']} error={errors.gender} />
                        <InputField label="Nationality" value={formData.nationality} onChange={(v: string) => handleInputChange('nationality', v)} placeholder="e.g. United Kingdom" error={errors.nationality} />
                    </div>
                </section>

                {/* Contact Section */}
                <section className="bg-white p-10 rounded-3xl border border-blue-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-blue-900 rounded-lg text-white">
                            <span className="material-symbols-outlined text-base">contact_mail</span>
                        </div>
                        <h2 className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">Contact Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField label="Registered Email" value={user.email || ''} onChange={() => { }} type="email" placeholder={user.email} readOnly />
                        <InputField label="Phone Number" value={formData.phoneNumber} onChange={(v: string) => handleInputChange('phoneNumber', v)} placeholder="+1 (555) 000-0000" error={errors.phoneNumber} />
                    </div>
                </section>

                {/* Residential Details */}
                <section className="bg-white p-10 rounded-3xl border border-blue-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-blue-900 rounded-lg text-white">
                            <span className="material-symbols-outlined text-base">home</span>
                        </div>
                        <h2 className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">Residential Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <InputField label="Residential Address" value={formData.address} onChange={(v: string) => handleInputChange('address', v)} placeholder="123 Career St, Industrial Park" error={errors.address} />
                        </div>
                        <InputField label="City" value={formData.city} onChange={(v: string) => handleInputChange('city', v)} error={errors.city} />
                        <InputField label="State / Province" value={formData.state} onChange={(v: string) => handleInputChange('state', v)} error={errors.state} />
                        <InputField label="Country of Residence" value={formData.countryOfResidence} onChange={(v: string) => handleInputChange('countryOfResidence', v)} error={errors.countryOfResidence} />
                        <InputField label="Zip / Postal Code" value={formData.zipCode} onChange={(v: string) => handleInputChange('zipCode', v)} />
                    </div>
                </section>

                {/* Languages Section */}
                <section className="bg-white p-10 rounded-3xl border border-blue-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-900 rounded-lg text-white">
                                <span className="material-symbols-outlined text-base">language</span>
                            </div>
                            <h2 className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">Languages Spoken</h2>
                        </div>
                        <button 
                            onClick={() => setFormData(prev => ({ ...prev, languages: [...prev.languages, { language: '', level: 'Professional' }] }))}
                            className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-900 transition-colors"
                        >
                            + Add Language
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.languages.map((lang, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-4 items-end bg-blue-50/50 p-6 rounded-2xl border border-blue-50">
                                <div className="flex-1 w-full">
                                    <InputField 
                                        label="Language" 
                                        value={lang.language} 
                                        onChange={(v) => {
                                            const newLangs = [...formData.languages];
                                            newLangs[idx].language = v;
                                            setFormData(prev => ({ ...prev, languages: newLangs }));
                                        }} 
                                        placeholder="e.g. English"
                                    />
                                </div>
                                <div className="flex-1 w-full">
                                    <InputField 
                                        label="Proficiency Level" 
                                        value={lang.level} 
                                        onChange={(v) => {
                                            const newLangs = [...formData.languages];
                                            newLangs[idx].level = v;
                                            setFormData(prev => ({ ...prev, languages: newLangs }));
                                        }} 
                                        options={['Native', 'Professional', 'Limited']}
                                    />
                                </div>
                                <button 
                                    onClick={() => {
                                        const newLangs = formData.languages.filter((_, i) => i !== idx);
                                        setFormData(prev => ({ ...prev, languages: newLangs }));
                                    }}
                                    className="p-3 text-red-400 hover:text-red-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        ))}
                        {formData.languages.length === 0 && (
                            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest text-center py-6 border-2 border-dashed border-blue-50 rounded-2xl">
                                No languages added to profile.
                            </p>
                        )}
                    </div>
                </section>

                {/* Save Footer */}
                <div className="flex justify-end gap-4 p-8 bg-blue-50 rounded-2xl border border-blue-100 items-center">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mr-auto px-4">Last Updated: {new Date(user.updatedAt || Date.now()).toLocaleDateString()}</p>
                    <button
                        onClick={handleSave}
                        disabled={updateProfileMutation.isPending}
                        className="px-10 py-4 bg-blue-900 text-white font-bold rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-blue-800 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {updateProfileMutation.isPending ? 'Saving Profile...' : 'Save Profile'}
                    </button>
                </div>
            </div>
        </div>
    );
}

interface InputFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    readOnly?: boolean;
    options?: string[] | null;
    error?: string;
}

const InputField = ({
    label,
    value,
    onChange,
    type = "text",
    placeholder = "",
    readOnly = false,
    options = null,
    error = ""
}: InputFieldProps) => (
    <div className="space-y-2">
        <label className={`text-[10px] font-bold uppercase tracking-widest px-1 transition-colors ${error ? 'text-red-500' : 'text-blue-400'}`}>{label}</label>
        {options ? (
            <select
                className={`w-full bg-blue-50 border rounded-lg px-4 py-3 text-sm font-bold transition-all appearance-none ${error ? 'border-red-300 text-red-900 focus:ring-red-500/10' : 'border-blue-200 text-blue-900 focus:bg-white focus:ring-blue-900/5'} outline-none focus:ring-2`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">Select {label}</option>
                {options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        ) : (
            <input
                className={`w-full bg-blue-50 border rounded-lg px-4 py-3 text-sm font-bold transition-all outline-none focus:ring-2 ${readOnly ? 'opacity-60 cursor-not-allowed border-blue-200' : ''} ${error ? 'border-red-300 text-red-900 focus:ring-red-500/10' : 'border-blue-200 text-blue-900 focus:bg-white focus:ring-blue-900/5'}`}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                readOnly={readOnly}
            />
        )}
        {error && <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest px-1 mt-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
);

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-blue-400">Loading Module...</div>}>
            <ProfileContent />
        </Suspense>
    );
}
