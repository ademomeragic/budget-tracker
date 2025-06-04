using Google.Cloud.DocumentAI.V1;
using Google.Protobuf;
using Grpc.Core;
using Microsoft.Extensions.Logging;
using System.Text;

namespace BudgetTracker.Infrastructure.Services
{
    public class DocumentAiReceiptParser
    {
        private readonly string _projectId = "896537080370";
        private readonly string _location = "eu";
        private readonly string _processorId = "a5189098834412a2";

        private readonly ILogger<DocumentAiReceiptParser> _logger;

        public DocumentAiReceiptParser(ILogger<DocumentAiReceiptParser> logger)
        {
            _logger = logger;
        }

        public async Task<string> ParseReceiptAsync(Stream imageStream, string fileName)
        {
            try
            {
                _logger.LogInformation("🔍 Starting Document AI parsing...");

                if (!imageStream.CanSeek)
                    throw new InvalidOperationException("❌ Stream must be seekable");

                imageStream.Position = 0;

                var mimeType = GetMimeTypeFromExtension(fileName);
                _logger.LogInformation("📎 File: {FileName}, MIME Type: {MimeType}", fileName, mimeType);
                _logger.LogInformation("📦 Stream Length: {Length}", imageStream.Length);

                var processorName = ProcessorName.FromProjectLocationProcessor(_projectId, _location, _processorId);
                var client = await DocumentProcessorServiceClient.CreateAsync();

                ByteString byteContent;
                try
                {
                    byteContent = ByteString.FromStream(imageStream);
                    _logger.LogInformation("✅ Stream converted to ByteString");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "🔥 Failed to convert stream to ByteString");
                    throw;
                }

                var rawDocument = new RawDocument
                {
                    Content = byteContent,
                    MimeType = mimeType
                };

                var request = new ProcessRequest
                {
                    Name = processorName.ToString(),
                    RawDocument = rawDocument
                };

                _logger.LogInformation("📤 Sending request to Document AI...");

                var result = await client.ProcessDocumentAsync(request);

                _logger.LogInformation("✅ Document AI processing completed.");
                return result.Document.ToString();
            }
            catch (RpcException rpcEx)
            {
                _logger.LogError("❌ GRPC Error: {StatusCode} - {Detail}", rpcEx.Status.StatusCode, rpcEx.Status.Detail);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ General Exception during Document AI parse");
                throw;
            }
        }

        private string GetMimeTypeFromExtension(string fileName)
        {
            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            return ext switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".pdf" => "application/pdf",
                _ => throw new ArgumentException($"❌ Unsupported file extension: {ext}")
            };
        }
    }
}
