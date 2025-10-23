import { ICO_CONFIG } from './config/ico';

export const SUPPORTED_TOKENS: Record<string, { name: string; icon: string }> = {
  USDT: { name: 'USDT', icon: '/images/tether.svg' },
  BNB: { name: 'BNB', icon: '/images/bnb.svg' },
};

export const TECH_PARTNERS = [
  { name: 'NVIDIA', domain: 'nvidia.com' },
  { name: 'DeepMind', domain: 'deepmind.com' },
  { name: 'OpenAI', domain: 'openai.com' },
  { name: 'Google', domain: 'google.com' },
  { name: 'H2O.ai', domain: 'h2o.ai' },
  { name: 'Dask', domain: 'dask.org' },
];

export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Dividends', href: '#' },
  { label: 'Staking', href: '#' },
  { label: 'Wiki', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Socials', href: '#' },
  
]

export { ICO_CONFIG };