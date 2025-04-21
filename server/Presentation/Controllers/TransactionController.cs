using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;
using System.Threading.Tasks;
using Application.Dtos;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        // GET: api/transaction
        [HttpGet]
        public async Task<IActionResult> GetAllTransactions()
        {
            var transactions = await _transactionService.GetAllAsync();
            return Ok(transactions);
        }

        // GET: api/transaction/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTransactionById(int id)
        {
            var transaction = await _transactionService.GetByIdAsync(id);
            if (transaction == null)
                return NotFound();

            return Ok(transaction);
        }

        // POST: api/transaction
        [HttpPost]
        public async Task<IActionResult> CreateTransaction([FromBody] CreateTransactionRequest request)
        {
            if (request == null) return BadRequest();

            var created = await _transactionService.AddAsync(request);
            return CreatedAtAction(nameof(GetTransactionById), new { id = created.Id }, created);
        }

        // PUT: api/transaction/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaction(int id, [FromBody] UpdateTransactionRequest request)
        {
            if (id != request.Id) return BadRequest("ID mismatch.");

            var existing = await _transactionService.GetByIdAsync(id);
            if (existing == null) return NotFound();

            await _transactionService.UpdateAsync(request);
            return NoContent();
        }

        // DELETE: api/transaction/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var existing = await _transactionService.GetByIdAsync(id);
            if (existing == null) return NotFound();

            await _transactionService.DeleteAsync(id);
            return NoContent();
        }
    }
}
