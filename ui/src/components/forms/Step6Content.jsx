import React from 'react';
import MustVisitPlacesContent from './step6/MustVisitPlacesContent';
import KeyWordsContent from './step6/KeyWordsContent';

const Step6Content = ({ step6SubStep }) => {
  
  return (
    <div className='p-6'>
      {step6SubStep === 0 ? <MustVisitPlacesContent /> : <KeyWordsContent />}
    </div>
  );
};

export default Step6Content;