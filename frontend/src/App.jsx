import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export function ResumeScreener() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeZip, setResumeZip] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleZipUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith(".zip")) {
      alert("Please upload a valid .zip file containing resumes.");
      return;
    }
    setResumeZip(file);
  };

  const handleSubmit = async () => {
    if (!jobDescription || !resumeZip) {
      setError("Please provide a job description and upload a zip of resumes.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const formData = new FormData();
      formData.append("resumes", resumeZip);
      formData.append("job_description", jobDescription); 

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/screen`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to fetch results.");

      const data = await response.json();
      setResults(data.matches);
    } catch (err) {
      console.error("Failed to screen resumes:", err);
      setError("Something went wrong while screening resumes.");
    }

    setLoading(false);
  };

  const handleClear = () => {
    setJobDescription("");
    setResumeZip(null);
    setResults([]);
    setError(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">AI Resume Screener</h1>

      <Card className="mb-6">
        <CardContent className="space-y-4 p-6">
          <label className="font-semibold">Paste Job Description:</label>
          <Textarea
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Enter job requirements here..."
          />

          <label className="font-semibold">Upload Zip File of Resumes:</label>
          <Input type="file" accept=".zip" onChange={handleZipUpload} />

          <div className="flex space-x-4 mt-4">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Screening..." : "Screen Candidates"}
            </Button>
            <Button variant="outline" onClick={handleClear}>Clear All</Button>
          </div>

          {error && <p className="text-red-500">{error}</p>}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Top Matches</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2 px-4">Candidate</th>
                  <th className="py-2 px-4">Matched Skills</th>
                  <th className="py-2 px-4">Experience (Years)</th>
                  <th className="py-2 px-4">Education</th>
                  <th className="py-2 px-4">Score</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="py-2 px-4">
                     <div className="relative group inline-block">
                       {res.name}
                       {res.caution && (
                       <span className="ml-2 text-yellow-500 cursor-pointer">
                               ⚠️
                     <div className="absolute hidden group-hover:block bg-yellow-100 text-yellow-900 text-xs p-1 rounded shadow-md mt-1 z-10">
                       High skill match – manual review suggested
                           </div>
                         </span>
                          )}
                         </div>
                        </td>
                    <td className="py-2 px-4">{res.matched_skills.join(", ")}</td>
                    <td className="py-2 px-4">{res.experience_years}</td>
                    <td className="py-2 px-4">{res.education ? "Yes" : "No"}</td>
                    <td className="py-2 px-4">{(res.score * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ResumeScreener;
