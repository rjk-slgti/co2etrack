import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Globe, Calendar, Building } from 'lucide-react';

const COUNTRIES = [
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'IN', name: 'India' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'UAE' },
];

export default function SettingsPage() {
  const [country, setCountry] = useState('LK');
  const [orgName, setOrgName] = useState('');
  const [gwpSet, setGwpSet] = useState('AR6');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your organization and reporting preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" /> Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Organization Name</Label>
            <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Your company name" />
          </div>
          <div className="space-y-2">
            <Label>Primary Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Used for emission factor selection hierarchy</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> Reporting Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>GWP Assessment Report</Label>
            <Select value={gwpSet} onValueChange={setGwpSet}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AR4">IPCC AR4 (2007)</SelectItem>
                <SelectItem value="AR5">IPCC AR5 (2014)</SelectItem>
                <SelectItem value="AR6">IPCC AR6 (2021)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg border p-4">
            <h4 className="mb-2 font-medium">Factor Selection Hierarchy</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge>1</Badge> Country-specific factor ({COUNTRIES.find(c => c.code === country)?.name})
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">2</Badge> Regional factor
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">3</Badge> DEFRA / NGER
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">4</Badge> IPCC default
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Active Datasets
          </CardTitle>
          <CardDescription>Emission factor datasets currently in use</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">DEFRA 2024</p>
                <p className="text-xs text-muted-foreground">UK Government GHG Conversion Factors</p>
              </div>
              <Badge className="bg-primary">Active</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">IPCC AR6 Defaults</p>
                <p className="text-xs text-muted-foreground">Global default emission factors</p>
              </div>
              <Badge className="bg-primary">Active</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Sri Lanka Grid Factors 2024</p>
                <p className="text-xs text-muted-foreground">CEB/PUCSL electricity grid emission factors</p>
              </div>
              <Badge className="bg-primary">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
