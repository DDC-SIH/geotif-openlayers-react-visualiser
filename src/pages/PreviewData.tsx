
import { searchFiles } from '@/api-client';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function PreviewData() {
    const query = useQuery();
    const [items, setItems] = useState([]);
    const [commonData, setCommonData] = useState([]);

    useEffect(() => {
        const product = query.get('p');
        const prefix = product?.split('_')[0];
        const dataProcessingLevel = product?.split('_')[1];
        const standard = product?.split('_')[2];
        const version = query.get('v');

        if (prefix && dataProcessingLevel && standard && version) {
            searchFiles({ prefix, dataProcessingLevel, standard, version })
                .then(data => {
                    // console.log(data);
                    setItems(data.items);
                    setCommonData(data.commonAttributes);
                })
                .catch(error => console.error('Error fetching data:', error));
        }
    }, [query]);

    return (
        <div>PreviewData</div>
    );
}

export default PreviewData;