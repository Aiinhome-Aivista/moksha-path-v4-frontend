import { Link } from 'react-router-dom';

interface BrandProps {
  nameColor?: string;
}

const Brand = ({ nameColor }: BrandProps) => {
  return (
    <Link to="/" className="brand" aria-label="MokshPath home">
      <img src="/assets/logogod.svg" alt="" className="brand-mark" />
      <div>
        <div className="name" style={nameColor ? { color: nameColor } : undefined}>
          MokshPath <span style={{ color: 'var(--saffron)' }}>Academia</span>
        </div>
        <div className="tag">सत्यं ज्ञानं · a guided path to true learning</div>
      </div>
    </Link>
  );
};

export default Brand;
