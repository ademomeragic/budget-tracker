using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Google.Cloud.Vision.V1;

namespace BudgetTracker.Infrastructure.Services
{
    public class GoogleVisionService
    {
        private readonly ImageAnnotatorClient _client;

        public GoogleVisionService(ImageAnnotatorClient? client = null)
        {
            _client = client ?? ImageAnnotatorClient.Create();
        }

        public async Task<(string RawText, string? Error)> ExtractTextFromImageAsync(Stream imageStream)
        {
            try
            {
                var image = Image.FromStream(imageStream);
                var response = await _client.DetectDocumentTextAsync(image);
                return (response.Text, null);
            }
            catch (Exception ex)
            {
                return ("", $"Error extracting text: {ex.Message}");
            }
        }
    }

}
