import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import countryCodes from '@/lib/google-countries.json';

import SubmitButton from '@/components/SubmitButton';

import { analyseKeywordAction } from '@/actions/keywordAnalyser';

export function KeywordAnalyserForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse</CardTitle>
        <CardDescription>
          Optimize your pages for maximum visibility with ease.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={analyseKeywordAction} className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="keyword-location">Location</Label>
            <Input
              id="keyword-location"
              name="keyword-location"
              required
              placeholder='e.g. "Western Cape, South Africa"'
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="keyword-locale">
              Google Locale (e.g. &quot;South Africa&quot; for google.co.za)
            </Label>
            <Select name="keyword-locale" required defaultValue="za">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {countryCodes.map((countryCode) => (
                    <SelectItem
                      key={countryCode.country_code}
                      value={countryCode.country_code}
                    >
                      {countryCode.country_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="keyword-url">
              Enter URL including &apos;https://&apos;
            </Label>
            <Input
              id="keyword-url"
              name="keyword-url"
              required
              placeholder='e.g. "https://example.com/landing-page/"'
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="keyword-keywords">
              Enter Keywords (one line at a time)
            </Label>
            <Textarea
              name="keyword-keywords"
              id="keyword-keywords"
              placeholder="super cool keyword"
              required
            />
          </div>
          <div className="space-y-1">
            <SubmitButton submitText="Analysing">Analyse</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
