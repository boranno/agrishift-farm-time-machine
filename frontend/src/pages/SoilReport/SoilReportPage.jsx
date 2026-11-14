import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Save,
  Info,
  Sparkles
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useFarm } from '../../context/FarmContext';
import {
  validateSoilCardFile,
  extractSoilReport,
  SAMPLE_SOIL_CARD
} from '../../services/soilService';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';

const SOIL_PARAMETER_FIELDS = [
  'pH',
  'ec',
  'nitrogenMgKg',
  'phosphorusMgKg',
  'potassiumMgKg'
];

const toFormValues = (values = {}) => Object.fromEntries(
  SOIL_PARAMETER_FIELDS.map(field => [
    field,
    values[field] === null || values[field] === undefined ? '' : String(values[field])
  ])
);

export const SoilReportPage = () => {
  const { t, isBangla } = useTranslation();
  const { soil, updateSoil } = useFarm();

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState('');
  const [ocrFailureDetail, setOcrFailureDetail] = useState('');
  const [formError, setFormError] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState({ progress: 0, stageEn: '', stageBn: '' });
  const [extractionResult, setExtractionResult] = useState(null);
  const [isDemoValues, setIsDemoValues] = useState(soil?.isDemo === true);
  const [ecBasisConfirmed, setEcBasisConfirmed] = useState(true);

  const [formFields, setFormFields] = useState(() => toFormValues(soil));

  const [missingWarning, setMissingWarning] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setFileError('');
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (files && files[0]) {
      processSelectedFile(files[0]);
    }
    if (e.currentTarget?.tagName === 'INPUT') e.currentTarget.value = '';
  };

  const processSelectedFile = (file) => {
    const val = validateSoilCardFile(file);
    if (!val.valid) {
      setFileError(t(`soilOCR.${val.error}`));
      return;
    }

    setFileError('');
    setOcrFailureDetail('');
    setSelectedFile(file);
    setIsDemoValues(false);
    setEcBasisConfirmed(false);
    setFormFields(toFormValues());
    setMissingWarning(false);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.onerror = () => setFileError(t('soilOCR.previewFailed'));
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    setOcrProgress({ progress: 0, stageEn: '', stageBn: '' });
    startOcrExtraction(file);
  };

  const startOcrExtraction = async (fileOrId) => {
    setIsProcessing(true);
    setExtractionResult(null);
    setSavedSuccess(false);
    setFormError('');
    if (extractionResult?.isMock !== true) setIsDemoValues(false);

    try {
      const result = await extractSoilReport(fileOrId, setOcrProgress);
      setExtractionResult(result);
      setIsDemoValues(result.isMock === true);
      setEcBasisConfirmed(result.ecBasis !== 'unspecified');
      setFormFields(toFormValues(result.extractedValues));
      setMissingWarning(result.missingFields.length > 0);
    } catch (err) {
      setFileError(t('soilOCR.ocrFailed'));
      setOcrFailureDetail(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = (sampleId) => {
    if (sampleId !== SAMPLE_SOIL_CARD.id) return;
    const sample = SAMPLE_SOIL_CARD;
    setFileError('');
    setOcrFailureDetail('');
    setSelectedFile({ name: sample.cardName, size: 0, type: 'application/x-demo' });
    setFilePreview(null);
    setExtractionResult(sample);
    setIsDemoValues(true);
    setEcBasisConfirmed(sample.ecBasis !== 'unspecified');
    setFormFields(toFormValues(sample.extractedValues));
    setMissingWarning(sample.missingFields.length > 0);
    setSavedSuccess(false);
  };

  const handleInputChange = (field, val) => {
    setFormFields(prev => ({
      ...prev,
      [field]: val
    }));
    setSavedSuccess(false);
    setFormError('');
  };

  const handleSaveToProfile = (e) => {
    e.preventDefault();
    if (extractionResult?.ecBasis === 'unspecified' && !ecBasisConfirmed) {
      setFormError(t('soilOCR.confirmEcBasisError'));
      return;
    }

    const pH = Number(formFields.pH);
    const ec = Number(formFields.ec);
    const optionalNutrients = SOIL_PARAMETER_FIELDS
      .filter(field => !['pH', 'ec'].includes(field))
      .map(field => formFields[field] === '' ? null : Number(formFields[field]));

    if (
      formFields.pH === '' || !Number.isFinite(pH) || pH < 3 || pH > 10 ||
      formFields.ec === '' || !Number.isFinite(ec) || ec < 0 || ec > 30 ||
      optionalNutrients.some(value => value !== null && (!Number.isFinite(value) || value < 0 || value > 100000))
    ) {
      setFormError(t('soilOCR.validationError'));
      return;
    }

    const numberOrNull = value => value === '' ? null : Number(value);
    try {
      updateSoil({
        pH,
        ec,
        nitrogenMgKg: numberOrNull(formFields.nitrogenMgKg),
        phosphorusMgKg: numberOrNull(formFields.phosphorusMgKg),
        potassiumMgKg: numberOrNull(formFields.potassiumMgKg),
        organicMatter: null,
        nitrogen: null,
        phosphorus: null,
        potassium: null,
        sulfur: null,
        zinc: null,
        boron: null,
        isDemo: isDemoValues
      });
    } catch {
      setFormError(t('soilOCR.saveFailed'));
      return;
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div>
      <PageHeader
        title={t('soilOCR.title')}
        subtitle={t('soilOCR.subtitle')}
        badge={<DemoBadge text="Feature 5" />}
        actions={
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleLoadSample(SAMPLE_SOIL_CARD.id)}
              className="btn btn-secondary btn-sm"
            >
              <FileText size={14} />
              <span>{t('soilOCR.loadVideoDemo')}</span>
            </button>
          </div>
        }
        helpText={isBangla
          ? 'রিপোর্টের ছবি থেকে ব্রাউজারেই OCR চালান অথবা ল্যাবের মান হাতে লিখুন। OCR-এর মান যাচাই করে তারপর সংরক্ষণ করুন।'
          : 'Read a report image with browser-based OCR or enter lab values manually. Review every value before saving it to your farm profile.'}
      />

      <div className="callout callout-demo">
        <Info size={18} />
        <span>{t('soilOCR.browserOcrNotice')}</span>
      </div>

      {savedSuccess && (
        <div className="callout callout-info animate-fade-in">
          <CheckCircle2 size={18} color="var(--color-primary-600)" />
          <span>
            {t('soilOCR.validationSuccess')}{' '}
            <Link to="/crop-suitability">{t('soilOCR.viewUpdatedSuitability')}</Link>
          </span>
        </div>
      )}

      {fileError && (
        <div className="callout" style={{ backgroundColor: 'var(--color-risky-bg)', borderColor: 'var(--color-risky-border)', color: 'var(--color-risky-text)' }}>
          <AlertTriangle size={18} />
          <span>
            {fileError}
            {ocrFailureDetail && (
              <details style={{ marginTop: '0.5rem' }}>
                <summary>{t('soilOCR.errorDetails')}</summary>
                <code>{ocrFailureDetail}</code>
              </details>
            )}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Dropzone & Preview */}
        <div>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="card"
            style={{
              border: '2px dashed var(--color-border)',
              backgroundColor: 'var(--color-bg-cream)',
              textAlign: 'center',
              padding: '2.5rem 1.5rem',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('soil-file-input').click()}
          >
            <input
              id="soil-file-input"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.webp"
              onChange={handleFileDrop}
              onClick={e => e.stopPropagation()}
              style={{ display: 'none' }}
            />

            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-100)',
              color: 'var(--color-primary-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <UploadCloud size={26} />
            </div>

            <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: '0.4rem', color: 'var(--color-primary-900)' }}>
              {t('soilOCR.dropzoneTitle')}
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', maxWidth: '380px', margin: '0 auto' }}>
              {t('soilOCR.dropzoneSubtitle')}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '0.75rem auto 0', maxWidth: '380px' }}>
              {t('soilOCR.manualEntryHint')}
            </p>
          </div>

          {/* Extraction Scanning Progress Bar */}
          {isProcessing && (
            <div className="card" style={{ marginTop: '1rem', backgroundColor: 'var(--color-bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: 'var(--font-size-xs)' }}>
                <span style={{ fontWeight: '600', color: 'var(--color-primary-800)' }}>
                  {isBangla ? ocrProgress.stageBn : ocrProgress.stageEn}
                </span>
                <span>{ocrProgress.progress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E7EB', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  width: `${ocrProgress.progress}%`,
                  height: '100%',
                  backgroundColor: 'var(--color-primary-600)',
                  transition: 'width 300ms ease'
                }} />
              </div>
            </div>
          )}

          {/* Document Preview Card */}
          {selectedFile && !isProcessing && (
            <div className="card" style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} color="var(--color-primary-800)" />
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                    {selectedFile.name}
                  </span>
                </div>
                <span className="badge badge-suitable" style={{ fontSize: '11px' }}>
                  {extractionResult
                    ? extractionResult.isMock ? t('soilOCR.sampleLoaded') : t('soilOCR.ocrScanned')
                    : t('soilOCR.fileSelected')}
                </span>
              </div>

              {filePreview ? (
                <div style={{ maxHeight: '220px', overflow: 'hidden', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <img src={filePreview} alt={isBangla ? 'মাটি পরীক্ষার কার্ডের প্রিভিউ' : 'Soil Card Preview'} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              ) : (
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-bg-main)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-xs)',
                  lineHeight: 1.6
                }}>
                  <div><strong>{isBangla ? 'নথি:' : 'Document:'}</strong> {extractionResult?.cardName || selectedFile.name}</div>
                  {extractionResult?.farmerName && (
                    <div><strong>{isBangla ? 'কৃষক:' : 'Farmer:'}</strong> {extractionResult.farmerName}</div>
                  )}
                  {extractionResult?.district && (
                    <div><strong>{isBangla ? 'অবস্থান:' : 'Location:'}</strong> {extractionResult.district}, {extractionResult.upazila}</div>
                  )}
                  {extractionResult?.soilTexture && (
                    <div><strong>{isBangla ? 'মাটির গঠন:' : 'Texture:'}</strong> {extractionResult.soilTexture}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Extracted Values Review & Editing Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Sparkles size={18} color="var(--color-primary-800)" />
              <span>{t('soilOCR.extractionReview')}</span>
            </h2>
            <DemoBadge
              text={isDemoValues
                ? t('soilOCR.sampleDataBadge')
                : t('soilOCR.editableValuesBadge')}
            />
          </div>

          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            {t('soilOCR.reviewNotice')}
          </p>

          {isDemoValues && (
            <div className="callout callout-demo" style={{ fontSize: '12px', padding: '0.65rem 0.85rem' }}>
              <Info size={15} style={{ flexShrink: 0 }} />
              <span>{t('soilOCR.demoValuesNotice')}</span>
            </div>
          )}

          {missingWarning && (
            <div className="callout callout-warning" style={{ fontSize: '12px', padding: '0.65rem 0.85rem' }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>
                {extractionResult?.missingFields.length === SOIL_PARAMETER_FIELDS.length
                  ? t('soilOCR.ocrNoValues')
                  : t('soilOCR.missingWarning')}
              </span>
            </div>
          )}

          {formError && (
            <div
              className="callout"
              style={{ backgroundColor: 'var(--color-risky-bg)', borderColor: 'var(--color-risky-border)', color: 'var(--color-risky-text)', marginBottom: '1rem' }}
              role="alert"
            >
              <AlertTriangle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSaveToProfile}>
            {/* Soil card values used by the current prototype: pH, ECe, and NPK. */}
            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="ocr-ph">
                  {t('soilOCR.ph')}
                </label>
                <input
                  id="ocr-ph"
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="10.0"
                  value={formFields.pH}
                  onChange={e => handleInputChange('pH', e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="ocr-ec">
                  {t('soilOCR.ec')}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="ocr-ec"
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={formFields.ec}
                    onChange={e => handleInputChange('ec', e.target.value)}
                    className="form-control"
                    required
                  />
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    dS/m
                  </span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '-0.4rem 0 1rem' }}>
              {t('soilOCR.ecBasisNotice')}
            </p>

            {extractionResult?.ecBasis === 'unspecified' && (
              <div className="callout callout-warning" style={{ marginBottom: '1rem' }}>
                <Info size={16} />
                <div>
                  <p style={{ fontSize: 'var(--font-size-xs)', marginBottom: '0.5rem' }}>
                    {t('soilOCR.ecMethodUnknown')}
                  </p>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-main)' }}>
                    <input
                      type="checkbox"
                      checked={ecBasisConfirmed}
                      onChange={event => {
                        setEcBasisConfirmed(event.target.checked);
                        setFormError('');
                      }}
                      style={{ marginTop: '0.2rem' }}
                    />
                    <span>{t('soilOCR.confirmEcMethod')}</span>
                  </label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="ocr-n">
                  {t('soilOCR.nitrogen')}
                </label>
                <input
                  id="ocr-n"
                  type="number"
                  step="1"
                  min="0"
                  max="100000"
                  value={formFields.nitrogenMgKg}
                  onChange={e => handleInputChange('nitrogenMgKg', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="ocr-p">
                  {t('soilOCR.phosphorus')}
                </label>
                <input
                  id="ocr-p"
                  type="number"
                  step="1"
                  min="0"
                  max="100000"
                  value={formFields.phosphorusMgKg}
                  onChange={e => handleInputChange('phosphorusMgKg', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="ocr-k">
                  {t('soilOCR.potassium')}
                </label>
                <input
                  id="ocr-k"
                  type="number"
                  step="1"
                  min="0"
                  max="100000"
                  value={formFields.potassiumMgKg}
                  onChange={e => handleInputChange('potassiumMgKg', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Save size={16} />
              <span>{t('soilOCR.saveToProfile')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SoilReportPage;
