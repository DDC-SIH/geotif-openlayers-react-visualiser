import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Copy } from 'lucide-react';
import { getAllApiKeys, generateApiKey, toggleApiKeyStatus } from '@/api-client';
import { useAppContext } from '../../contexts/AppContext';

interface ApiKey {
  apiKey: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  validTill: string;
}

export default function ApiPlayground() {
  const [apiName, setApiName] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<{ [key: string]: boolean }>({});
    const {showToast} = useAppContext();
  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const data = await getAllApiKeys();
      setApiKeys(data.apiKeys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!apiName) return;

    try {
      const data = await generateApiKey(apiName);
      setApiKeys(data.apiKeys);
      setApiName('');
    } catch (error) {
      console.error('Error generating API key:', error);
    }
  };

  const handleToggleApiKeyStatus = async (apiKey: string) => {
    try {
      const data = await toggleApiKeyStatus(apiKey);
      setApiKeys(data.apiKeys);
    } catch (error) {
      console.error('Error toggling API key status:', error);
    }
  };

  const isExpired = (validTill: string) => new Date() > new Date(validTill);

  const toggleVisibility = (apiKey: string) => {
    setVisibleKeys((prev) => ({
      ...prev,
      [apiKey]: !prev[apiKey],
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast({message:'API key copied to clipboard!',type:'SUCCESS'});
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">API Playground</h1>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Generate API Key</h2>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="API Name"
            value={apiName}
            onChange={(e) => setApiName(e.target.value)}
          />
          <Button onClick={handleGenerateApiKey}>Generate</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">API Keys</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((api) => (
              <TableRow key={api.apiKey}>
                <TableCell>{api.name}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2 w-[250]">
                    <span className='flex-1'>
                      {visibleKeys[api.apiKey]
                        ? api.apiKey
                        : '*********************************************'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibility(api.apiKey)}
                    >
                      {visibleKeys[api.apiKey] ? <EyeOff /> : <Eye />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(api.apiKey)}
                    >
                      <Copy />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={api.status === 'ACTIVE' ? 'default' : 'destructive'}>
                    {api.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {isExpired(api.validTill) ? (
                    <span className="flex items-center text-destructive">
                      <AlertCircle className="mr-1 h-4 w-4" />
                      Expired
                    </span>
                  ) : (
                    <span className="flex items-center text-success">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Valid until {new Date(api.validTill).toLocaleDateString()}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleApiKeyStatus(api.apiKey)}
                  >
                    {api.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
